<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {twMerge} from "tailwind-merge";

defineProps<{
    modelValue: string|number,
    tag?: 'input' | 'textarea' | 'number' | 'password' | 'button',
    type?: 'button' | 'checkbox' | 'color' | 'date' | 'datetime' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week',
}>();

defineEmits(['update:modelValue']);

const input = ref<HTMLElement>();

onMounted(() => {
    if (input.value && input.value.hasAttribute('autofocus')) {
        input.value.focus();
    }
});

defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
    <component :is="tag ?? 'input'"
        ref="input"
        :class="twMerge('form-control rounded-md shadow-sm px-3 py-1.5 placeholder:text-gray-400', $attrs.class as string)"
        :value="modelValue"
        :type="type"
        @input="$emit('update:modelValue', $event.target.value)"
    />
</template>
