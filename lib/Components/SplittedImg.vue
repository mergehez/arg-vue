<script setup lang="ts">
import {twMerge} from "tailwind-merge";
import {reactive} from "vue";

const props = defineProps<{
    sources: string[],
    alts: string[],
    height: string | number,
    width: string | number,
    class?: string,
    animate?: boolean,
}>()
const tolerance = 10;
const top = 25;
const bottom = 100 - top;
const images = reactive(
    [
        {
            imgSrc: props.sources[0],
            clip: `polygon(0 0, 100% 0, 100% calc(${top}% - 1px), 0 calc(${bottom}% - 1px))`,
            zIndex: 0,
            full: false
        },
        {
            imgSrc: props.sources[1],
            clip: `polygon(0 calc(${bottom}% + 1px), 100% calc(${top}% + 1px), 100% 100%, 0 100%)`,
            zIndex: 0,
            full: false
        },
    ]
)
let isOver = false;
function onMouseMove(event: MouseEvent) {
    // if (!props.animate)
    //     return;
    isOver = true;
    const div = event.target as HTMLDivElement;
    const x = (event.offsetX * 100) / div.offsetWidth;
    const y = (event.offsetY * 100) / div.offsetHeight;

    let first = false,
        second = false;
    if (y < top - tolerance) {
        first = true;
    } else if (y > bottom + tolerance) {
        second = true;
    } else if ((x + y) < 100 - tolerance) {
        first = true;
    } else if ((x + y) > 100 + tolerance) {
        second = true;
    }
    images[0].zIndex = first ? 1 : 0
    images[0].full = first
    images[1].full = second
}

function onMouseLeave() {
    // if (!props.animate)
    //     return;
    isOver = false;
    images[0].zIndex = 0
    images[1].zIndex = 0
    images[0].full = false
    images[1].full = false
}
</script>

<template>
    <div
        :class="twMerge('relative rounded-lg bg-x4 outline outline-1 outline-x3 overflow-hidden', props.class)"
        :style="{height: height, width: width}"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
    >
        <template v-for="(a, i) in images">
            <img
                :src="a.imgSrc"
                :alt="props.alts[i]"
                class="absolute inset-0 w-full h-full object-fill rounded-lg transition-[clip-path] duration-500"
                :style="{
                    clipPath: !a.full ? a.clip : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                    zIndex: a.zIndex,
                }"
            >
        </template>
    </div>
</template>
