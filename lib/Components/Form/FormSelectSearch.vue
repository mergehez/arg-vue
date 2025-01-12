<script setup lang="ts">
import {arrToObj} from "../../utils";
import FormSelectBase from "./FormSelectBase.vue";
import {FormSelectProps} from "./FormSelect.vue";
import latinize from "latinize";


const props = withDefaults(defineProps<FormSelectProps & { search?: (text: string, q: string) => boolean }>(), {
    trPrefix: '',
    translate: true,
    trFunc: (t: any) => window.__(t),
    search: (text: string, q: string) => {
        q = latinize(q.toLowerCase());
        return latinize(text.toLowerCase()).includes(q);
    }
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