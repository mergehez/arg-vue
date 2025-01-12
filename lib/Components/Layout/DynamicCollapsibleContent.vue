<script setup lang="ts">

import {twMerge} from "tailwind-merge";

defineProps<{
    show: boolean
}>()
</script>

<template>
    <div
        :class="twMerge('col-span-3 transition-[padding] duration-300 w-full basis-full', $attrs.class as any)"
        v-show="show">
        <slot></slot>
    </div>
</template>