<script setup lang="ts" generic="TValue extends string|number">
import {enumToObj} from "../../utils";
import FormMultiSelectBase from "./FormMultiSelectBase.vue";

const selection = defineModel<TValue[]>({required: true});
const props = withDefaults(defineProps<{
    options:  Record<string, TValue>,
    translate?: boolean,
    id?: string,
    placeholder?: string
    wrapperClass?: string,
    acceptInput?: boolean,
    trFunc?: (key: string) => string,
    valueAsKey?: boolean
}>(), {
    valueAsKey: false,
    trFunc: (t: string) => t,
    translate: true,
    acceptInput: false
})

const _options = enumToObj(props.options, props.valueAsKey);
const numberKey = Object.values(_options).every(k => !isNaN(Number(k)));
</script>

<template>
    <FormMultiSelectBase
        :options="_options as any"
        selects-value
        :model-value="selection"
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
