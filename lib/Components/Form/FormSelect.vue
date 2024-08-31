<script setup lang="ts">
import {twMerge} from "tailwind-merge";
import {ref, watch} from "vue";
import {TArgVueTrKeys, usePage, arrToObj} from "../../utils";
type TKey = string|number;

const props = withDefaults(defineProps<{
    options: Record<string, TKey> | TKey[],
    trFunc?: (key: TArgVueTrKeys) => string,
    translate?: true,
    modelValue?: any
} | {
    options: Record<string, string> | string[],
    trFunc?: (key: TArgVueTrKeys) => string,
    translate: false,
    modelValue?: any
}>(), { trPrefix: '', translate: true, trFunc: (t: string) => t, })

defineEmits(['update:modelValue'])

function generateOptions(){
    return Array.isArray(props.options)
        ? arrToObj(props.options,  props.translate ? ((t: any) => props.trFunc(t)) : t => t)
        : props.translate ? arrToObj(Object.keys(props.options), (k: any) => props.trFunc((props.options as any)[k] as any)) : props.options;
}

const page = usePage();
const _options = ref(generateOptions());
watch(() => page.props?.localization.locale, () => _options.value = generateOptions())

</script>

<template>
    <select :class="twMerge('form-control px-3 py-2', $attrs.class as any)"
            :value="modelValue"
            @change="$emit('update:modelValue', ($event.target as any).value)">
        <option v-for="(text, key) in _options" :value="key" :selected="modelValue == key">{{ text }}</option>
    </select>
</template>
