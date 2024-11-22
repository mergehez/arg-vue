<script setup lang="ts">
import Spinner from "./Spinner.vue";
import {twMerge} from "tailwind-merge";

withDefaults(defineProps<{
    loading: boolean,
    svgSize?: string,
    hideIcOnLoad?: boolean,
    icClass?: string,
}>(), {
    hideIcOnLoad: true,
})
</script>

<template>
    <button :class="twMerge('gap-2', $attrs.class as any)">
        <template v-if="icClass && hideIcOnLoad">
            <span class="relative inline-flex justify-center items-center">
                <i v-if="icClass" :style="!hideIcOnLoad || !loading ? 'opacity:1' : 'opacity:0'" :class="icClass"></i>
                <Spinner :loading="loading" :svg-size="svgSize" :class="loading ? 'absolute' : ''"/>
            </span>
        </template>
        <template v-else>
            <i v-if="icClass" :class="icClass"></i>
            <Spinner v-else :loading="loading" :svg-size="svgSize"/>
        </template>
        <slot/>
    </button>
</template>
