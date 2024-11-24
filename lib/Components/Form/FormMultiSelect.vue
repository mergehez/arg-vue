<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import {vOnClickOutside} from '@vueuse/components'
import {arrToObj, search} from "../../utils/helpers";
import {twMerge} from "tailwind-merge";

type TKey = string | number;

const selection = defineModel<TKey[]>({required: true});
const props = withDefaults(defineProps<{
    options: Record<TKey, string> | string[],
    translate?: boolean,
    id?: string,
    placeholder?: string
    wrapperClass?: string,
    acceptInput?: boolean,
    trFunc?: (key: string) => string,
}>(), {
    trFunc: (t: string) => t,
    translate: true,
    acceptInput: false
})

const _options = Array.isArray(props.options)
    ? arrToObj(props.options, (t: any) => props.translate === false ? t : props.trFunc(t))
    : arrToObj(Object.keys(props.options), (k: any) => props.translate === false ? props.options[k] : props.trFunc(props.options[k]));

const q = ref('');
const focused = ref(false);

function removeSelection(opt: TKey) {
    selection.value = selection.value.filter(t => t !== opt)
}

function addSelection(opt: TKey, keepFocus = false) {
    selection.value.push(opt)
    if (keepFocus)
        refInput.value?.focus();
}

const onFocusListener = () => focused.value = true;
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
    if (props.acceptInput && q.value.trim().length > 0) {
        addSelection(q.value.trim());
        q.value = '';
    }
}

const lastPoppedSelections = ref([] as TKey[]);

function onQueryKeyUp(e: KeyboardEvent) {
    if (e.code == 'Escape' || e.code == 'Tab') {
        focused.value = false;
        if (e.code == 'Escape') {
            (document.activeElement as any).blur();
            q.value = '';
        } else {
            if (props.acceptInput && q.value.trim().length > 0) {
                addSelection(q.value.trim());
                q.value = '';
            } else if (!props.acceptInput) {
                q.value = '';
            }
        }
    }
    if (e.key == ',') {
        e.preventDefault()
        if (props.acceptInput && q.value.trim().length > 0) {
            e.preventDefault()
            addSelection(q.value.trim().replace(',', ''));
            q.value = '';
        }
    }
    if (e.code == 'Backspace' && q.value.length === 0) {
        lastPoppedSelections.value.push(selection.value.pop()!);
    }
}

</script>

<template>
    <div :class="twMerge('relative w-full text-xs', $attrs.class as any)"
         v-on-click-outside="onClickedOutside">
        <div :class="[{'ring-1': focused}, twMerge('flex items-center justify-start gap-0.5 flex-1 flex-wrap px-1.5 py-0 form-control', wrapperClass)]"
             class="">
            <template v-for="(key) in selection">
                <div class="alert alert-primary p-0 flex items-center cursor-pointer" @click="removeSelection(key)">
                    <div class="pl-2 text-xs">
                        {{ _options[key] ?? key }}
                    </div>
                    <i class="icon icon-[mdi--close] text-xs mr-px dark:text-white"></i>
                </div>
            </template>
            <div class="flex-1">
                <input type="text" v-model="q"
                       ref="refInput" :id="id"
                       :placeholder="selection.length ? '' : placeholder"
                       class="ml-1 w-full border-0 bg-transparent text-sm focus:!border-0 focus:!outline-none focus:!ring-0 py-1 px-0">

                <div v-show="focused" class="absolute left-0 bg-card-visible z-30 w-full rounded-b-md font-medium">
                    <div class="border border-light max-h-[500px] overflow-y-auto">
                        <template v-for="(text, key) in _options">
                            <div v-if="!selection.includes(key) && search(text, q)">
                                <div @click="addSelection(key, true)"
                                     class="list-group-item border-t px-2 py-1 border-light cursor-pointer rounded-none"
                                >
                                    {{ text }}
                                </div>
                            </div>
                        </template>
                        <template v-if="Object.keys(_options).length === 0">
                            <div class="text-gray-500">
                                No result
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
