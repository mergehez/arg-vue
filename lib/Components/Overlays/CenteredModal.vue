<script setup lang="ts">
import {twMerge} from "tailwind-merge";
import {overlayState} from "./overlay_utils";
import {onMounted, ref, watch} from "vue";

const props = defineProps({
    show: {type: Boolean, default: false,},
    contentClass: {type: String, default: '',},
    contentStyle: {type: String, default: '',},
    closeOnOutside: {type: Boolean, default: true,},
    verticalCenter: {type: Boolean, default: true,},
    closeButton: {type: Boolean, default: false,},
    tag: {type: String, default: '',},
});
const emit = defineEmits(['update:show', 'close']);
const zIndex = ref(50);

watch(() => props.show, (nv) => {
    if (nv) {
        zIndex.value = overlayState.modalZIndex += 1;
    }
})

function updateShow(v: boolean) {
    emit('update:show', v)
    if (!v) {
        emit('close');
    }
}

onMounted(() => {
    zIndex.value = overlayState.modalZIndex += 1;
})
</script>

<template>
    <Teleport to="body">
        <div
            :style="[
                {
                    'z-index': zIndex,
                    'visibility': show ? 'visible' : 'hidden',
                    'opacity': show ? '1' : '0',
                    'transition': 'visibility 0.3s linear,opacity 0.3s linear'
                },
                $attrs.style as any
            ]"
            :class="[
                tag,
                twMerge('fixed left-0 top-0 w-screen h-screen flex justify-center', $attrs.class as any),
                {
                    'items-center':verticalCenter,
                    'items-start': !verticalCenter,
                }
        ]"
            aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div @click="() => closeOnOutside ? updateShow(false) : {}"
                 class="fixed inset-0 bg-gray-500/75 dark:bg-gray-700/75"></div>

            <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
            >
                <div class="z-10 flex justify-center" :class="{
                    'items-center':verticalCenter,
                    'items-start': !verticalCenter,
                 }">
                    <div :class="twMerge('rounded-md ring-1 ring-x3 ring-opacity-5 py-1 bg-x0 max-h-[95vh] relative', contentClass)" :style="contentStyle">
                        <slot/>
                        <button v-if="closeButton" class="btn btn-text-light absolute top-2 right-1" @click="updateShow(false)"><i class="ic ic-close"></i></button>
                    </div>
                </div>
            </transition>
        </div>
    </Teleport>
</template>
