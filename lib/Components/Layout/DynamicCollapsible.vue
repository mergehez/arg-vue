<script setup lang="ts">
import DynamicCollapsibleContent from "./DynamicCollapsibleContent.vue";

// TODO: NOTE: use Collapsible.vue instead of this!!!
defineProps<{
    show: boolean,
    text: string,
    contentClass?: string,
    targetSelector?: string
}>();
defineEmits<{ 'toggle': [] }>()

</script>

<template>
    <slot name="button" :toggle="() => $emit('toggle')">
        <button class="btn-link whitespace-nowrap gap-1" @click="$emit('toggle')" data-ajax="1" role="button" :aria-expanded="show" aria-label="collapse expand button">
            {{ text }}
            <i class="mt-px icon" :class="show ? 'icon-[bi--caret-up-fill]' : 'icon-[bi--caret-down-fill]'"></i>
        </button>
    </slot>
    <DynamicCollapsibleContent v-if="!targetSelector" :show="show" :class="$attrs.class">
        <slot></slot>
    </DynamicCollapsibleContent>
</template>
