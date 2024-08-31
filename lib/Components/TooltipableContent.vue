<script setup lang="ts">

import {Popper} from "./Overlays";

const props = defineProps<{
    text: string
}>()


</script>

<template>
    <Popper hover>
        <template #trigger>
            <slot></slot>
        </template>

        <template #content>
            <span class="px-1.5 py-1 text-sm">
                {{ text }}
            </span>
        </template>
    </Popper>
</template>