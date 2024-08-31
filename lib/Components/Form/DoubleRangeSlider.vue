<script setup lang="ts">

import {computed, ref} from "vue";
import TextInput from "./TextInput.vue";

const props = withDefaults(defineProps<{
    min: number,
    max: number,
    left: number,
    right: number,
    step?: number,
}>(), {
    step: 1,
})

const emit = defineEmits<{
    'update:left':[v: number],
    'update:right':[v: number],
}>();

const _left = ref(props.left)
const _right = ref(props.right)
const leftPos = computed(() => calcPos(_left.value))
const rightPos = computed(() => calcPos(_right.value))
const thumbSize = 18;
const minDiff = props.step;

function calcPos(val: number){
    return ((val - props.min) / (props.max - props.min)) * 100;
}

function moveLeft(e: Event|number) {
    const val = typeof e === 'number' ? e : parseInt((e.target as HTMLInputElement).value);
    validateMinMax(val, _right.value);
    _left.value = Math.min(_left.value, _right.value - minDiff);
    emit('update:left', _left.value);
}
function moveRight(e: Event|number) {
    const val = typeof e === 'number' ? e : parseInt((e.target as HTMLInputElement).value);
    validateMinMax(_left.value, val);
    _right.value = Math.max(_right.value, _left.value + minDiff)
    emit('update:right', _right.value);
}

function validateMinMax(l:number, r:number){
    _left.value = Math.max(Math.min(l, props.max - minDiff), props.min);
    _right.value = Math.max(Math.min(r, props.max), props.min + minDiff);
}
</script>

<template>
    <div class="relative w-full dbl-range-slider">
        <div class="relative" :style="{'height': `${thumbSize}px`}">
            <input type="range" :step="step" :min="min" :max="max" @input="moveLeft" :value="_left"
                   :style="`--thumb-size: ${thumbSize}px`"
                   class="absolute pointer-events-none appearance-none z-20 h-full w-full opacity-0 cursor-pointer">
            <input type="range" :step="step" :min="min" :max="max" @input="moveRight" :value="_right"
                   :style="`--thumb-size: ${thumbSize}px`"
                   class="absolute pointer-events-none appearance-none z-20 h-full w-full opacity-0 cursor-pointer">

            <div class="relative z-10 flex items-center h-full" :style="{'margin': `0 ${thumbSize/2}px`}">
                <div class="absolute z-10 left-0 right-0 rounded-md bg-x3 h-1/3"></div>
                <div class="absolute z-20 rounded-md bg-indigo-400 h-1/3" :style="`right:${100 - rightPos}%; left:${leftPos}%`"></div>
                <div class="absolute z-30 aspect-square bg-indigo-400 rounded-full"
                     :style="`width: ${thumbSize}px; left: calc(${leftPos}% - ${thumbSize/2}px);`"></div>
                <div class="absolute z-30 aspect-square bg-indigo-400 rounded-full"
                     :style="`width: ${thumbSize}px; left: calc(${rightPos}% - ${thumbSize/2}px);`"></div>
            </div>
        </div>
        <div class="flex items-center justify-between pt-1.5 text-sm text-gray-700">
            <TextInput type="number" :model-value="_left" @input="moveLeft" class="w-16 pl-2 pr-1 py-0.5 text-sm" />
            <TextInput type="number" :model-value="_right" @input="moveRight" class="w-16 pl-2 pr-1 py-0.5 text-sm" />
        </div>
    </div>
</template>

<style>
    /*noinspection CssUnresolvedCustomProperty*/
    .dbl-range-slider input[type=range]::-webkit-slider-thumb {
        pointer-events: all;
        width: var(--thumb-size, 18px);
        aspect-ratio: 1;
        -webkit-appearance: none;
    }
</style>
