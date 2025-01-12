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
    numberKey?: boolean,
    singleSelection?: boolean,
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
    if (props.singleSelection) {
        selection.value = [val];
        query.value = '';
        setTimeout(() => {
            focused.value = false;
            // focusedRow.value = undefined;
        }, 1)
    } else {
        selection.value.push(val as any)
        filteredOptions.value = filteredOptions.value.filter(k => k !== opt);
        if (keepFocus) {
            refInput.value?.focus();
        }
    }
}

const inputRect = ref<{ left: number, width: number }>();
const refTopWrapper = ref<HTMLDivElement>();
const onFocusListener = () => {
    inputRect.value = {
        left: refTopWrapper.value!.getBoundingClientRect().left,
        width: refTopWrapper.value!.offsetWidth,
    }
    focused.value = true;

    if (props.singleSelection && selection.value.length > 0) {
        setTimeout(() => {
            focusedRow.value = filteredOptions.value.findIndex(t => t == selection.value[0]);
            scrollToFocusedRow();
        }, 50)
    }
};
const refInput = ref<HTMLInputElement>();
onMounted(() => {
    if (!refInput.value) return;

    refInput.value.addEventListener('keydown', onQueryKeyUp);
    refInput.value.addEventListener('focusin', onFocusListener);
    if (props.singleSelection && selection.value.length > 0) {
        setTimeout(() => {
            focusedRow.value = filteredOptions.value.findIndex(t => t == selection.value[0]);
            scrollToFocusedRow();
        }, 50)
    }
})
onBeforeUnmount(() => {
    if (!refInput.value) return;

    refInput.value.removeEventListener('focusin', onFocusListener);
    refInput.value.removeEventListener('keydown', onQueryKeyUp);
})

function onClickedOutside() {
    focused.value = false;
    if (!props.singleSelection)
        focusedRow.value = undefined;
    if (props.acceptInput && query.value.trim().length > 0) {
        addSelection(query.value.trim() as TKey);
        query.value = '';
    }
}

const filteredOptions = ref(Object.keys(props.options).filter(k => !selection.value.includes(getSelectionValue(k))) as TKey[]);
const focusedRow = ref<number>();
// watch(focusedRow, () => {
//     scrollToFocusedRow();
// })
watch(query, (v, o) => {
    if (!props.singleSelection) {
        focusedRow.value = undefined;
        scrollToFocusedRow();
    }
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
        scrollToFocusedRow();
    } else if (e.code == 'ArrowUp') {
        focusedRow.value = ((focusedRow.value ?? 0) - 1 + filteredOptions.value.length) % filteredOptions.value.length;
        scrollToFocusedRow();
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

const __ = window.__;
</script>

<template>
    <div ref="refTopWrapper"
         :class="twMerge('text-xs', singleSelection ? '' : 'w-full', $attrs.class as any)"
         v-on-click-outside="onClickedOutside">
        <div
            :class="[
                {'ring-1': focused},
                twMerge(
                    'flex  items-center flex-1 flex-wrap py-0 form-control',
                    singleSelection ? 'flex-col relative justify-center pr-7' : 'px-1.5 justify-start gap-0.5',
                    wrapperClass
                )
            ]"
            @click.prevent="singleSelection && onFocusListener()"
            class="">
            <template v-for="(key) in selection">
                <div v-if="singleSelection" class="py-1.5 cursor-pointer flex justify-center">
                    {{ getText(selectsValue ? keyByValue(options, key) : options[key]) }}
                    <i class="icon icon-[mdi--chevron-down] right-2 text-lg absolute pointer-events-none select-none"></i>
                </div>
                <div v-else class="alert alert-primary p-0 flex items-center cursor-pointer" @click="removeSelection(key)">
                    <div class="pl-2 text-xs">
                        {{ getText(selectsValue ? keyByValue(options, key) : options[key]) }}
                    </div>
                    <i class="icon icon-[mdi--close] text-xs mr-px dark:text-white"></i>
                </div>
            </template>
            <div class="flex-1 ">
                <input v-if="!singleSelection" type="text" v-model="query"
                       ref="refInput" :id="id"
                       :placeholder="selection.length ? '' : placeholder"
                       autocomplete="off"
                       class="ml-1 w-full border-0 bg-transparent text-sm focus:!border-0 focus:!outline-none focus:!ring-0 py-1 px-0">

                <div v-show="focused" class="fixed bg-card-visible z-30 w-full rounded-b-md font-medium"
                     :style="{
                            'left': (inputRect?.left ?? 0) + 'px',
                            'width': singleSelection ? 'auto' : (inputRect?.width ?? 0) + 'px'
                        }">
                    <div v-if="singleSelection" class="relative w-full flex items-center">
                        <input type="text" v-model="query"
                               ref="refInput" :id="id"
                               :placeholder="placeholder ?? __('search')"
                               autocomplete="off"
                               class="border border-x5 bg-x3 text-sm focus:border-x6 focus:ring-0 focus:outline-none py-1 px-2 w-full">
                        <i class="icon icon-[mingcute--search-line] opacity-80 right-2 text-lg absolute pointer-events-none select-none"></i>
                    </div>
                    <div ref="refFilters" class="border border-light max-h-[500px] overflow-y-auto">
                        <template v-for="(key, index) in filteredOptions">
                            <span @click="addSelection(key, !singleSelection)"
                                  class="list-group-item border-t px-2 py-1 border-light cursor-pointer rounded-none"
                                  :class="{
                                    'bg-indigo-300 dark:bg-indigo-900 hover:bg-indigo-300 hover:dark:bg-indigo-900': focusedRow === index,
                                    'hover:bg-x1': focusedRow !== index,
                                    'bg-green-300 dark:bg-green-900': singleSelection && selection.includes(getSelectionValue(key)),
                                }"
                            >
                                {{ getText(selectsValue ? key : (options as any)[key]) }}
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
