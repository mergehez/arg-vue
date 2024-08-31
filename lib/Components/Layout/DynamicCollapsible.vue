<script setup lang="ts">
import DynamicCollapsibleContent from "./DynamicCollapsibleContent.vue";

defineProps<{
    show: boolean,
    text: string,
    contentClass?: string,
    targetSelector?: string
}>();
defineEmits<{'toggle' : []}>()

</script>

<template>
    <slot name="button" :toggle="() => $emit('toggle')">
        <button class="btn-link whitespace-nowrap" @click="$emit('toggle')" data-ajax="1" role="button" :aria-expanded="show" aria-label="collapse expand button">
            {{text}}
            <i class="ic" :class="show ? 'ic-caret-up' : 'ic-caret-down'"></i>
        </button>
    </slot>
    <DynamicCollapsibleContent v-if="!targetSelector" :show="show" :class="$attrs.class">
        <slot></slot>
    </DynamicCollapsibleContent>
</template>
