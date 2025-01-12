<script setup lang="ts" generic="TKey extends string | number, TValue, TSelection extends string | number = TKey">
import {arrToObj} from "../../utils";
import FormMultiSelectBase from "./FormMultiSelectBase.vue";

// type TKey = string | number;

const selection = defineModel<TSelection[]>({required: true});
const props = withDefaults(defineProps<{
    options: Record<TKey, TValue> | string[],
    translate?: boolean,
    id?: string,
    placeholder?: string
    wrapperClass?: string,
    acceptInput?: boolean,
    trFunc?: (key: any) => string,
    selectsValue?: boolean
}>(), {
    selectsValue: false,
    trFunc: (t: any) => t,
    translate: true,
    acceptInput: false
})

const opts = props.options;
const _options = Array.isArray(opts)
    ? arrToObj(opts, (t: any) => props.translate === false ? t : props.trFunc(t))
    : arrToObj(Object.keys(opts), (k: string) => props.translate === false ? (opts as any)[k] : props.trFunc((opts as any)[k]));

const numberKey = Object.values(_options).every(k => !isNaN(Number(k)));

</script>

<template>
    <FormMultiSelectBase
        :options="_options"
        :selects-value="selectsValue"
        :model-value="selection as any"
        @update:model-value="v => selection = v as any"
        :numberKey="numberKey"
        :trFunc="props.trFunc"
        :translate="props.translate"
        :id="props.id"
        :placeholder="props.placeholder"
        :wrapperClass="props.wrapperClass"
        :acceptInput="props.acceptInput"
    />
</template>
