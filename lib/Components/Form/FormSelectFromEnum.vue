<script setup lang="ts" generic="TEnumValue extends string|number">
import {TArgVueTrKeys, enumToObj} from "../../utils";
import FormSelectBase from "./FormSelectBase.vue";

const props = withDefaults(defineProps<{
    trFunc?: (key: TArgVueTrKeys) => string,
    translate?: boolean,
    class?: string,
    wrapperClass?: string,
    options: Record<string, TEnumValue>
    valueAsKey?: boolean
}>(), {
    valueAsKey: true,
    trPrefix: '',
    translate: true,
    trFunc: (t: any) => window.__(t),
});

const modelValue = defineModel<TEnumValue>();

const _options = enumToObj(props.options, props.valueAsKey);
const numberKey = Object.keys(_options).every(k => !isNaN(Number(k)));
</script>

<template>
    <FormSelectBase
        :model-value="modelValue"
        @update:modelValue="val => modelValue = val"
        :options="_options"
        :numberKey="numberKey"
        :trFunc="props.trFunc"
        :translate="props.translate"
        :class="props.class"/>
</template>