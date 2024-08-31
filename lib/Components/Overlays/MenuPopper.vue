<script setup lang="ts">

import Popper from "./Popper.vue";
import {Placement} from "@popperjs/core";
import {twMerge} from "tailwind-merge";

const props = withDefaults(defineProps<{
    placement?: Placement,
    center?: boolean,
    contentClass?: string,
    triggerWrapperClass?: string,
    customTrigger?: boolean,
}>(), {
    placement: 'bottom',
    center: true,
    triggerWrapperClass: 'inline-flex items-center justify-center',
})
</script>

<template>
    <Popper v-bind="{...props, ...$attrs}"
            :class="twMerge('inline-flex items-center justify-center', $attrs.class as any)"
            :content-class="twMerge('bg-x1 overflow-hidden items-start divide-y divide-light', contentClass)">
        <template #trigger="data">
            <slot name="trigger" v-bind="data ?? {}"></slot>
        </template>
        <template #content="data">
            <slot name="content" v-bind="data ?? {}"
                  :close="data.close"
                  :cls="(center ? '' : 'justify-start ') + 'list-group-item btn-hover whitespace-nowrap transition-all duration-300 rounded-none py-4 px-5'"></slot>
        </template>
    </Popper>
</template>
