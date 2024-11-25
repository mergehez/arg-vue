<script setup lang="ts">
import {twMerge} from "tailwind-merge";
import {ref, watch} from "vue";
import {TArgVueTrKeys, usePage, arrToObj, uniqueId} from "../../utils";
import FormSelectBase from "./FormSelectBase.vue";

// type TKey = string | number;

const props = withDefaults(defineProps<{
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
})>(), {
    trPrefix: '',
    translate: true,
    trFunc: (t: any) => window.__(t),
});

const emit = defineEmits(['update:modelValue'])

function generateOptions() {
    // return arrToObj(props.options, props.translate ? ((t: any) => props.trFunc(t)) : t => t.toString());
    return arrToObj(props.options, t => t.toString());
}

const page = usePage();
const _options = ref(generateOptions());
watch(() => page.props?.localization.locale, () => _options.value = generateOptions())

</script>

<template>
    <FormSelectBase
        :model-value="modelValue"
        @update:modelValue="val => emit('update:modelValue', val)"
        :options="_options"
        :numberKey="props.numberKey"
        :trFunc="props.trFunc"
        :translate="props.translate"
        :class="props.class"/>
</template>