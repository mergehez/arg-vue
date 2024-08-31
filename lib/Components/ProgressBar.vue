<script setup lang="ts">

import {onBeforeUnmount, onMounted, ref, watch} from "vue";

const props = withDefaults(defineProps<{
    modelValue: number,
    totalValue: number,
    listen?: boolean
}>(), {
    modelValue: 0,
    totalValue: 100,
    listen: true,
})

const emit = defineEmits(['update:modelValue'])

const progress =  ref(0); // % of totalValue
const trackProgress = ref<HTMLDivElement>();
const rect = ref<DOMRect>();

let isMouseDown = false;
function getClickPosition(ev: MouseEvent){
    if(!isMouseDown || !rect.value)
        return;

    let pos = (ev.pageX - rect.value.x) / rect.value.width;
    progress.value = Math.min(Math.max(pos, 0), 1) * 100
    let trackTime = (progress.value / 100) * props.totalValue
    emit('update:modelValue', trackTime)
}
function detectMouseDown(e: MouseEvent){
    isMouseDown = (e.target as HTMLElement)?.classList.contains('click-handler');
    if(isMouseDown){
        rect.value = trackProgress.value?.getBoundingClientRect();
    }
    getClickPosition(e);
    e.preventDefault() // prevent browser from moving objects, following links etc

    // start listening to mouse movements
    // trackProgress.value.addEventListener("mousemove", getClickPosition, false)
}
function detectMouseUp(){
    isMouseDown = false;
    // stop listening to mouse movements
    // trackProgress.value.removeEventListener("mousemove", getClickPosition, false)
}
function windowResize(){
    setTimeout(()=>{
        rect.value = trackProgress.value?.getBoundingClientRect();
    }, 200)
}
function listenToEvents(listen = true){
    if (listen){
        trackProgress.value?.addEventListener("click", getClickPosition, false)
        trackProgress.value?.addEventListener("mousedown", detectMouseDown, false)
        document.addEventListener("mousemove", getClickPosition, false)
        document.addEventListener("mouseup", detectMouseUp, false)
    }
    else{
        trackProgress.value?.removeEventListener("click", getClickPosition, false)
        trackProgress.value?.removeEventListener("mousedown", detectMouseDown, false)
        document.removeEventListener("mousemove", getClickPosition, false)
        document.removeEventListener("mouseup", detectMouseUp, false)
    }
}

// calibrate progress
function calibrateProgress(currentVal = props.modelValue, totalVal = props.totalValue){
    let max = ((currentVal / totalVal) *100)
    progress.value = max <= 100 ? max : 100
}

// apply opacity to color
// function hexOpacity(hex:string, opacity:number){
//     let op = (opacity * 100) <= 99 ? (opacity * 100) : 99
//     localBarColor.value = `${hex}`+op
// }


onMounted(() => {
    // calibrate progress
    calibrateProgress(props.modelValue, props.totalValue)
    // set seek bar color
    // hexOpacity(props.barColor, props.intensity)
    // start listening to taps and clicks
    listenToEvents(props.listen)
    // recalibrate progress width on window width resize
    window.addEventListener('resize', windowResize, false)
    windowResize()
})

onBeforeUnmount(()=> {
    window.removeEventListener('resize', windowResize)
})

watch(() => props.modelValue, v => calibrateProgress(v))
watch(() => props.listen, v => listenToEvents(v))
watch(() => props.totalValue, v => calibrateProgress(props.modelValue, v))
</script>

<template>
    <div class="relative w-full h-full min-h-[30px] flex items-center z-0">
        <div class="simple-progress absolute left-0 right-0 h-1.5 bg-gradient-to-r from-teal-600 from-0% select-none"
             :style="`background: yellow; background: linear-gradient(90deg, var(--color) 0%, var(--color) ${progress}%, var(--bg) ${progress}%, var(--bg) 90%);`">

        </div>
        <span :style="`left: calc(${progress}% - 8px);`" class="absolute h-4 rounded-full aspect-square bg-teal-600 select-none"></span>
        <div ref="trackProgress" class="click-handler absolute inset-0 bg-transparent z-10">

        </div>
    </div>
</template>

<style>
    .simple-progress ::selection{
        background: none;
    }

    .simple-progress{
        --color: theme('colors.teal.600');
        --bg: theme('colors.gray.300');
    }
    .dark .simple-progress{
        --bg: theme('colors.gray.700');
    }
</style>