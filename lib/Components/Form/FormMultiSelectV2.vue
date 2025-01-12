<script setup lang="ts" generic="TKey extends string | number">
import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import {vOnClickOutside} from '@vueuse/components'
import {keyByValue, search, TArgVueTrKeys} from "../../utils";
import {twMerge} from "tailwind-merge";

// type TKey = string | number;

const selection = defineModel<TKey[]>({required: true});
const props = withDefaults(defineProps<{
    options: Record<TKey, any>,
    translate?: boolean,
    id?: string,
    placeholder?: string
    wrapperClass?: string,
    acceptInput?: boolean,
    trFunc?: (key: string | TArgVueTrKeys) => string,
    selectsValue?: boolean,
    numberKey?: boolean
}>(), {
    numberKey: false,
    selectsValue: false,
    trFunc: (t: string) => t,
    translate: true,
    acceptInput: false
})

function getSelectionValue(key: TKey | any) {
    return props.selectsValue ? (props.options as any)[key] : key;
}

const query = ref('');
const focused = ref(false);

function removeSelection(opt: TKey) {
    selection.value = selection.value.filter(t => t !== opt)
}

function addSelection(opt: any, keepFocus = false) {
    const val = getSelectionValue(opt);
    selection.value.push(val as any)
    filteredOptions.value = filteredOptions.value.filter(k => k !== opt);
    if (keepFocus)
        refInput.value?.focus();
}

const inputRect = ref<{ left: number, width: number }>();
const refTopWrapper = ref<HTMLDivElement>();
const onFocusListener = () => {
    inputRect.value = {
        left: refTopWrapper.value!.getBoundingClientRect().left,
        width: refTopWrapper.value!.offsetWidth,
    }
    focused.value = true;
};
const refInput = ref<HTMLInputElement>();
onMounted(() => {
    if (!refInput.value) return;

    refInput.value.addEventListener('keydown', onQueryKeyUp);
    refInput.value.addEventListener('focusin', onFocusListener);
})
onBeforeUnmount(() => {
    if (!refInput.value) return;

    refInput.value.removeEventListener('focusin', onFocusListener);
    refInput.value.removeEventListener('keydown', onQueryKeyUp);
})

function onClickedOutside() {
    focused.value = false;
    focusedRow.value = undefined;
    if (props.acceptInput && query.value.trim().length > 0) {
        addSelection(query.value.trim() as TKey);
        query.value = '';
    }
}

const filteredOptions = ref(Object.keys(props.options).filter(k => !selection.value.includes(getSelectionValue(k))) as TKey[]);
const focusedRow = ref<number>();
watch(focusedRow, () => {
    scrollToFocusedRow();
})
watch(query, (v, o) => {
    focusedRow.value = undefined;
    scrollToFocusedRow();
    let res: any[];
    if (v.length == 0) {
        res = Object.keys(props.options);
    } else {
        res = Object.keys(props.options)
            .filter(k => search(getText(props.selectsValue ? k : (props.options as any)[k]), query.value));
    }
    filteredOptions.value = res.filter(k => !selection.value.includes(getSelectionValue(k)));
})

const lastPoppedSelections = ref([] as TKey[]);

function onQueryKeyUp(e: KeyboardEvent) {
    if (e.code == 'Enter')
        e.preventDefault();

    if (e.code == 'Escape' || e.code == 'Tab') {
        focused.value = false;
        if (e.code == 'Escape') {
            (document.activeElement as any).blur();
            query.value = '';
        } else {
            if (props.acceptInput && query.value.trim().length > 0) {
                addSelection(query.value.trim());
                query.value = '';
            } else if (!props.acceptInput) {
                query.value = '';
            }
        }
    }
    if (e.key == ',') {
        e.preventDefault()
        if (props.acceptInput && query.value.trim().length > 0) {
            e.preventDefault()
            addSelection(query.value.trim().replace(',', ''));
            query.value = '';
        }
    }
    if (e.code == 'Backspace' && query.value.length === 0) {
        lastPoppedSelections.value.push(selection.value.pop()! as any);
    } else if (e.code == 'ArrowDown') {
        focusedRow.value = ((focusedRow.value ?? -1) + 1 + filteredOptions.value.length) % filteredOptions.value.length;
    } else if (e.code == 'ArrowUp') {
        focusedRow.value = ((focusedRow.value ?? 0) - 1 + filteredOptions.value.length) % filteredOptions.value.length;
    } else if (e.code == 'Enter' && focusedRow.value !== undefined) {
        addSelection(filteredOptions.value[focusedRow.value], true);
        query.value = '';
    }
}

const refFilters = ref<HTMLDivElement>();

function scrollToFocusedRow() {
    if (focusedRow.value === undefined) {
        refFilters.value?.scrollTo({top: 0, behavior: 'instant'})
        return;
    }
    const child = refFilters.value?.children[focusedRow.value] as HTMLElement

    if (!child) return;

    refFilters.value?.scrollTo({
        top: child.offsetTop - refFilters.value.clientHeight / 2,
        behavior: 'instant'
    })
}

function getText(text: TKey): any {
    return props.translate ? props.trFunc(text as any) : text;
}

</script>

<template>
    <div ref="refTopWrapper" :class="twMerge('w-full text-xs', $attrs.class as any)"
         v-on-click-outside="onClickedOutside">
        <div :class="[{'ring-1': focused}, twMerge('flex items-center justify-start gap-0.5 flex-1 flex-wrap px-1.5 py-0 form-control', wrapperClass)]"
             class="">
            <template v-for="(key) in selection">
                <div class="alert alert-primary p-0 flex items-center cursor-pointer" @click="removeSelection(key)">
                    <div class="pl-2 text-xs">
                        {{ getText(selectsValue ? keyByValue(options, key) : key) }}
                    </div>
                    <i class="icon icon-[mdi--close] text-xs mr-px dark:text-white"></i>
                </div>
            </template>
            <div class="flex-1">
                <input type="text" v-model="query"
                       ref="refInput" :id="id"
                       :placeholder="selection.length ? '' : placeholder"
                       autocomplete="off"
                       class="ml-1 w-full border-0 bg-transparent text-sm focus:!border-0 focus:!outline-none focus:!ring-0 py-1 px-0">

                <div v-show="focused" class="fixed bg-card-visible z-30 w-full rounded-b-md font-medium"
                     :style="{
                            'left': (inputRect?.left ?? 0) + 'px',
                            'width': (inputRect?.width ?? 0) + 'px'
                        }">
                    <div ref="refFilters" class="border border-light max-h-[500px] overflow-y-auto">
                        <template v-for="(key, index) in filteredOptions">
                            <span @click="addSelection(key, true)"
                                  class="list-group-item border-t px-2 py-1 border-light cursor-pointer rounded-none"
                                  :class="{
                                    'bg-indigo-300 dark:bg-indigo-900 hover:bg-indigo-300 hover:dark:bg-indigo-900': focusedRow === index,
                                    'hover:bg-x1': focusedRow !== index
                                }"
                            >
                                {{ getText(selectsValue ? (options as any)[key] : key) }}
                            </span>
                        </template>
                        <template v-if="Object.keys(options).length === 0">
                            <div class="text-gray-500">
                                {{ trFunc('no_results') }}
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
