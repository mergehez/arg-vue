<script setup lang="ts">
import {TArgVueTrKeys, arrToObj} from "../../utils";
import FormSelectBase from "./FormSelectBase.vue";

const props = withDefaults(defineProps<{
    trFunc?: (key: TArgVueTrKeys) => string,
    translate?: boolean,
    class?: string,
    wrapperClass?: string,
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

const modelValue = defineModel<any>();


const _options = Array.isArray(props.options)
    ? arrToObj(props.options, props.translate ? ((t: any) => props.trFunc(t)) : t => t.toString())
    : props.translate
        ? arrToObj(Object.keys(props.options), (k: any) => props.trFunc((props.options as any)[k] as any))
        : props.options
</script>

<template>
    <FormSelectBase
        :model-value="modelValue"
        @update:modelValue="v => modelValue = v"
        :options="_options"
        :numberKey="props.numberKey"
        :trFunc="props.trFunc"
        :translate="props.translate"
        :class="props.class"/>
</template>