<template>
    <div v-auto-animate>
        <div
            v-for="(item, index) in _list"
            :key="getKey(item)"
            class="drag-item"
            :class="{ 'cursor-move opacity-20': dragIndex === index }"
            @touchstart.prevent="onTouchStart(index, $event)"
            @touchmove.prevent="onTouchMove($event)"
            @touchend="onTouchEnd"
        >
            <slot name="item" :item="item">
                {{ item }}
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { vAutoAnimate } from "@formkit/auto-animate/vue";

const props = defineProps<({
    list: (string | number)[],
    itemKey?: never,
    dragDelay?: number;
} | {
    list: Record<string, any>[],
    itemKey: string,
    dragDelay?: number;
})>();

const _list = ref(props.list);
watch(() => props.list, (v) => (_list.value = v));

function getKey(item: any) {
    return typeof item === 'string' || typeof item === 'number' ? item : item[props.itemKey as string];
}

const dragIndex = ref<number | null>(null);
let touchStartIndex = -1;

const onTouchStart = (index: number, _: TouchEvent) => {
    dragIndex.value = index;
    touchStartIndex = index;
};

const onTouchMove = (event: TouchEvent) => {
    if (dragIndex.value !== null) {
        // Implement logic to calculate the target index based on touch movement
        // This can vary depending on your specific requirements and layout
        // The example below is a simple implementation, and you may need to adjust it
        const touch = event.touches[0];
        const targetIndex = calculateTouchTargetIndex(touch.clientY);
        onDragOver(targetIndex);
    }
};

const onTouchEnd = () => {
    onDrop();
};

const onDragOver = (target: number) => {
    if (dragIndex.value !== null && target !== touchStartIndex) {
        const draggedItem = _list.value[dragIndex.value] as any;
        _list.value = _list.value.toSpliced(dragIndex.value, 1).toSpliced(target, 0, draggedItem);
        dragIndex.value = target;
    }
};

const onDrop = () => {
    // Handle drop logic here
    // You may want to update the list and reset the dragIndex
    dragIndex.value = null;
    touchStartIndex = -1;
};

function calculateTouchTargetIndex(clientY: number): number {
    // Implement logic to calculate the target index based on touch movement
    // This can vary depending on your specific requirements and layout
    // The example below is a simple implementation, and you may need to adjust it
    const container = document.querySelector('.drag-item'); // Replace with your container selector
    if (container) {
        const rect = container.getBoundingClientRect();
        const mouseY = clientY - rect.top;
        const itemHeight = rect.height / _list.value.length;
        return Math.min(Math.floor(mouseY / itemHeight), _list.value.length - 1);
    }
    return -1;
}
</script>
