<script setup lang="ts">

const props = defineProps<{
    src: string,
    alt: string,
    fallback: string,
}>()

let errTime = 0;

function onImgError(e: Event) {
    if (errTime++ > 0)
        return;
    (e.target as HTMLImageElement).src = props.fallback;
}
</script>

<template>

    <img
        :src="src"
        :alt="alt"
        @error.prevent="onImgError"
    />
</template>
