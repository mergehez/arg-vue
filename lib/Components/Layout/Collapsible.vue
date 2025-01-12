<script setup lang="ts">
import DynamicCollapsibleContent from "./DynamicCollapsibleContent.vue";

defineProps<{
    text?: string,
    contentClass?: string,
    targetSelector?: string
}>();
const visible = defineModel<boolean>('show',{
    default: false,
})
function toggle(){
    visible.value = !visible.value;
}
</script>

<template>
    <slot name="button" :toggle="toggle">
        <button class="btn-link whitespace-nowrap gap-1" @click="toggle" data-ajax="1" role="button" :aria-expanded="show" aria-label="collapse expand button">
            {{ text }}
            <i class="mt-px icon" :class="show ? 'icon-[bi--caret-up-fill]' : 'icon-[bi--caret-down-fill]'"></i>
        </button>
    </slot>
    <DynamicCollapsibleContent v-if="!targetSelector" :show="visible" :class="$attrs.class">
        <slot :visible="visible"></slot>
    </DynamicCollapsibleContent>
</template>
