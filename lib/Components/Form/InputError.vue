<script setup lang="ts">
import {computed} from "vue";
import {twMerge} from "tailwind-merge";

const props = defineProps<{
    message?: string,
    html?: boolean,
    contentClass?: string,
    labelClass?: string,
    class?: string,
    secondCol?: boolean, // puts a dummy i tag before. Useful for grid layouts
}>();

const cls = computed(() => twMerge('text-sm text-red-600 dark:text-red-400 error-message', props.contentClass))
</script>

<template>
    <template v-if="message">
        <i v-if="secondCol"></i>
        <div :class="twMerge('flex', props.class)">
            <i v-if="labelClass" :class="labelClass"></i>
            <div v-if="html" v-html="message" :class="cls"></div>
            <div v-else :class="cls">
                {{ message }}
            </div>
        </div>
    </template>
</template>
