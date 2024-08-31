<script setup lang="ts">

import {computed, ref, watch} from "vue";
import {breakpointsTailwind, useBreakpoints} from "@vueuse/core";
import {TArgVueTrKeys} from "../../utils";

const props = defineProps<{
    trans: ((trKey: TArgVueTrKeys) => string),
    categories: Record<string, string>,
    selected: string,
    indicatorOnMobile?: boolean,
    updateQuery?: boolean,
}>()
const emit = defineEmits<{
    'update:selected': [t: string]
}>()

const breakpoints = useBreakpoints(breakpointsTailwind, {});
const gap = computed(() => breakpoints.isGreaterOrEqual('lg') ? 8 : 4);

const cnt = ref(0)
const w = ref(0)
const i = ref(0)
const orders = ref([0,1,2,3])
propsUpdated();
watch(() => props.selected, (_, __) => {
    propsUpdated();
})
watch(() => props.categories, (_) => {
    propsUpdated();
})

function propsUpdated(){
    cnt.value = Object.keys(props.categories).length
    w.value = 100 / cnt.value
    i.value = Object.keys(props.categories).indexOf(props.selected)
    orders.value = [
        i.value > 0 ? 0 : i.value+2,
        i.value > 1 ? 1 : cnt.value+1,
        i.value > 2 ? 2 : cnt.value+2,
        i.value+1
    ]
}
function changeTab(val: string){
    if(props.updateQuery){
        const url = new URL(window.location.href);
        url.searchParams.set('tab', val);
        window.history.replaceState(null, '', url.toString())
    }
    emit('update:selected', val)
}
</script>

<template>
    <div class="flex w-full rounded bg-gray-100 dark:bg-gray-900 dark:border-gray-600 mb-2 relative" :style="{gap:gap+'px'}">
        <span class="absolute h-full bg-indigo-200/60 dark:bg-indigo-900 rounded-md transition-[left] duration-300 "
              :class="{'md:hidden': indicatorOnMobile}"
              :style="{
                left: `calc(${i * w}% + ${i*gap/cnt}px)`,
                width: `calc(${w}% - ${((cnt-1)*gap)/cnt}px)`
              }"></span>
        <template v-for="(trKey, cat) in categories" :key="cat">
            <span
                   class="flex-1 cursor-pointer rounded-md text-center text-sm z-10 p-1 select-none truncate"
                   :class="{'font-bold': !indicatorOnMobile && selected == cat}"
                  @click="changeTab(cat)" v-text="trans(trKey as any)" />
        </template>
    </div>
</template>
