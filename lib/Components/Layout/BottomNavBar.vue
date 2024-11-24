<script setup lang="ts">

import {ref, watch} from "vue";

const props = defineProps<{
    icons: string[],
    selected: string,
    updateQuery?: boolean
}>()
const emit = defineEmits<{
    'update:selected': [t: string]
}>()

const cnt = ref(0)
const w = ref(0)
const i = ref(0)
propsUpdated();
watch(() => props.selected, (_, __) => {
    propsUpdated();
})
watch(() => props.icons, (_) => {
    propsUpdated();
})

function propsUpdated() {
    cnt.value = props.icons.length
    w.value = 100 / cnt.value
    i.value = props.icons.indexOf(props.selected)
}

function changeTab(val: string) {
    if (props.updateQuery === true) {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', val);
        window.history.replaceState(null, '', url.toString())
    }
    emit('update:selected', val)
}
</script>

<template>
    <div class="flex w-full bg-x3 left-0 right-0 bottom-0 gap-1">
        <div class="absolute h-full transition-[left] ease-in-out duration-500 flex justify-center"
             :style="{
                left: `calc(${i * w}% + ${i*4/cnt}px)`,
                width: `calc(${w}% - ${((cnt-1)*4)/cnt}px)`
              }">
            <div id="sweep" class="h-full flex top-0 -mx-4" style="width: min(max(180px, 50%), 100%)">
                <div id="sweep-right" class="flex-grow before:shadow-x0"/>
                <div class="size-2 bg-x0"/>
                <div class="bg-x0 ring-x0 ring-8 rounded-full -mt-1" style="height: 40px; aspect-ratio: 1;"/>
                <div class="size-2 bg-x0"/>
                <div id="sweep-left" class="flex-grow before:shadow-x0"/>
            </div>
        </div>
        <template v-for="ic in icons" :key="ic">
            <div
                class="flex-1 cursor-pointer text-center text-sm z-10 p-1 select-none flex flex-col items-center justify-center h-14"
                :class="{'font-bold': selected == ic}"
                @click="changeTab(ic)">
                <span class="absolute inline-flex items-center justify-center rounded-full" :class="{
                    'bg-reverse text-x0 size-10 -mt-5 transition-all ease-in-out duration-500' : selected == ic,
                }">
                    <i :class="ic" class="text-xl"></i>
                </span>
                <!--<span>{{ title }}</span>-->
            </div>
        </template>
    </div>
</template>

<style>
#sweep-left,
#sweep-right {
    height: 30px;
    overflow: hidden;
    position: relative;
}

#sweep-left {
    right: 2px;
}

#sweep-right {
    left: 2px;
}

#sweep-left:before,
#sweep-right:before {
    content: '';
    display: block;
    width: 220%;
    height: 200%;
    position: absolute;
    border-radius: 50%;
    top: 0;
    box-shadow: 0 0 0 100px rgb(var(--bg0, white));
}

#sweep-left:before {
    left: 0;
}

#sweep-right:before {
    right: 0;
}
</style>