<script setup lang="ts">

import Spinner from "../Spinner.vue";
import {twMerge} from "tailwind-merge";

defineProps<{
    loading: boolean,
    svgSize?: string,
    opacity?: number
}>()

</script>

<template>
    <div :class="twMerge('absolute inset-0 flex items-center justify-center bg-x0 z-[1000] !bg-opacity-50', $attrs.class as any)" v-if="loading">
        <Spinner :loading="loading" :svg-size="svgSize || 'w-12'" />
    </div>
</template>
