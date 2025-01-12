
<script setup lang="ts">
import {PopperProps} from "./overlay_utils";
import PopperUnstyled from "./PopperUnstyled.vue";
import {twMerge} from "tailwind-merge";

const emit = defineEmits(["opened", "closed"]);
const props = withDefaults(defineProps<PopperProps>(), {
    disableClickAway: false,
    closeOnClickInside: true,
    offsetDistance: 8,
    visible: null,
    wrapperClass: '',
    contentClass: '',
})
</script>

<template>
    <PopperUnstyled
        v-bind="props"
        :content-class="twMerge('bg-x1 border border-x4 shadow-lg', contentClass)"
        >
        <template #trigger="{close, isOpen, open, toggle}">
            <slot name="trigger" :close="close" :isOpen="isOpen" :open="open" :toggle="toggle"></slot>
        </template>
        <template #content="{isOpen, close}">
            <slot name="content" :isOpen="isOpen" :close="close"></slot>
        </template>
    </PopperUnstyled>
</template>