<script setup lang="ts">
import {twMerge} from "tailwind-merge";
import {ref, watch} from "vue";
import {TArgVueTrKeys, usePage, arrToObj} from "../../utils";

// type TKey = string | number;

const props = withDefaults(defineProps<{
    // options: Record<TKey, string> | TKey[],
    trFunc?: (key: TArgVueTrKeys) => string,
    translate?: boolean,
    modelValue?: any,
    class?: string,
} & ({
    options: number[],
    numberKey: boolean
} | {
    options: string[],
    numberKey?: false
} | {
    options: Record<number, string>,
    numberKey: boolean
} | {
    options: Record<string, string>,
    numberKey?: false
})>(), {
    trPrefix: '',
    translate: true,
    trFunc: (t: any) => window.__(t),
});

const emit = defineEmits(['update:modelValue'])

function generateOptions() {
    return Array.isArray(props.options)
        ? arrToObj(props.options, props.translate ? ((t: any) => props.trFunc(t)) : t => t.toString())
        : props.translate
            ? arrToObj(Object.keys(props.options), (k: any) => props.trFunc((props.options as any)[k] as any))
            : props.options;
}

const page = usePage();
const _options = ref(generateOptions());
watch(() => page.props?.localization.locale, () => _options.value = generateOptions())

function onChange(event: Event) {
    let val: string | number = (event.target as HTMLSelectElement).value;
    if (props.numberKey) {
        val = parseInt(val);
    }
    emit('update:modelValue', val);
}

</script>

<template>
    <div class="relative flex items-center">
        <select :class="twMerge('form-control pl-3 pr-7 w-full appearance-none', props.class)"
                :value="modelValue"
                @change="onChange">
            <option v-for="(text, key) in _options" :value="key" :selected="modelValue == key">{{ text }}</option>
        </select>
        <i class="icon icon-[mdi--chevron-down] right-2 text-lg absolute pointer-events-none select-none"></i>
    </div>
</template>