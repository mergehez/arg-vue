<script setup lang="ts" generic="T extends object">
import {twMerge} from "tailwind-merge";
import {provide, ref, watch} from "vue";
import {TFormProps} from "./form_helpers";

const props = defineProps<TFormProps>()
const emit = defineEmits(['submit'])

const injectables = ref<TFormProps>(props)
watch(() => props, () => {
    injectables.value = props;
})
provide('formProps', injectables);
</script>

<template>
    <form @submit.prevent="$emit('submit')" :class="twMerge('flex flex-col w-full py-0 md:py-2', $attrs.class as any)">
        <slot></slot>
    </form>
</template>
