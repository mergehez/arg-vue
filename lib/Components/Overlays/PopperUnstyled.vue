
<script setup lang="ts">
import {
    ref,
    computed,
    useSlots,
    toRefs,
    watch,
    onMounted, reactive, nextTick, onBeforeUnmount,
} from "vue";
import {onClickOutside} from "@vueuse/core";
import {twMerge} from "tailwind-merge";
import {createPopper, Instance} from "@popperjs/core/lib/popper-lite.js";
import preventOverflow from "@popperjs/core/lib/modifiers/preventOverflow.js";
import flip from "@popperjs/core/lib/modifiers/flip.js";
import {Placement} from "@popperjs/core";

export type PopperProps = {
    placement?: Placement,
    offsetSkid?: number,
    offsetDistance?: number,
    arrowPadding?: number,
    content?: string,
    contentClass?: string,
    wrapperClass?: string,
    hover?: boolean,
    visible?: boolean|null,
    disableClickAway?: boolean,
    disabled?: boolean,
    arrow?: boolean,
    closeOnClickInside?: boolean,
    locked?: boolean,
    triggerWrapperClass?: string,
    customTrigger?: boolean,
}
const emit = defineEmits(["opened", "closed"]);
const slots = useSlots();
const props = withDefaults(defineProps<PopperProps>(), {
    disableClickAway: false,
    closeOnClickInside: true,
    offsetDistance: 8,
    visible: null
})

const popperContainerNode = ref<HTMLElement>();
const popperNode = ref<HTMLElement>();
const triggerNode = ref<HTMLElement>();
const modifiedIsOpen = ref(false);

onMounted(() => {
    if(slots.trigger === undefined)
        return console.error("[Popper]: The Popper component expects a child element with the slot name 'trigger'.");

    if(!props.disableClickAway)
        onClickOutside(popperContainerNode.value, () => closePopper());
});

const { isOpen, open, close } = usePopperX();
const manualMode = computed(() => props.visible !== null);
// const invalid = computed(() => props.disabled.value || !hasContent.value);
const invalid = computed(() => props.disabled);
const shouldShowPopper = computed(() => isOpen.value && !invalid.value);

// Add an invisible border to keep the Popper open when hovering from the trigger into it
const interactiveStyle = computed(() =>
    props.closeOnClickInside
        ? `border: ${props.offsetDistance}px solid transparent; margin: -${props.offsetDistance}px;`
        : null,
);

const openPopper = async () => {
    if (invalid.value || manualMode.value) {
        return;
    }
    open();
};

const closePopper = async (shouldClose = true) => {
    if(shouldClose)
        close();
};

const togglePopper = () => {
    if(isOpen.value)
        closePopper();
    else
        openPopper();
};

/**
 * If Popper is open, we automatically close it if it becomes
 * disabled or without content.
 */
watch(() => props.disabled, (val) => {
    if (isOpen.value && val) {
        close();
    }
});

/**
 * In order to eliminate flickering or visibly empty Poppers due to
 * the transition when using the isOpen slot property, we need to return a
 * separate debounced value based on isOpen.
 */
watch(isOpen, isOpen => {
    if (isOpen) {
        modifiedIsOpen.value = true;
    } else {
        setTimeout(() => {
            modifiedIsOpen.value = false;
        }, 200);
    }
});

watch(() => props.visible, (val) => {
    if(val)
        open()
    else{
        close();
    }
})

function usePopperX() {
    const state = reactive({
        isOpen: false,
        popperInstance: null as Instance | null,
    });

    // Enable or disable event listeners to optimize performance.
    const setPopperEventListeners = (enabled: boolean) => {
        state.popperInstance?.setOptions(options => ({
            ...options,
            modifiers: [...(options.modifiers ?? []), {name: "eventListeners", enabled}],
        }));
    };

    const enablePopperEventListeners = () => setPopperEventListeners(true);
    const disablePopperEventListeners = () => setPopperEventListeners(false);

    const close = () => {
        if (!state.isOpen) {
            return;
        }

        state.isOpen = false;
        emit("closed");
    };

    const open = () => {
        if (state.isOpen) {
            return;
        }

        state.isOpen = true;
        emit("opened");
    };

    // When isOpen or placement change
    watch([() => state.isOpen, () => props.placement], async ([isOpen]) => {
        if (isOpen) {
            await initializePopper();
            enablePopperEventListeners();
        } else {
            disablePopperEventListeners();
        }
    });

    const initializePopper = async () => {
        await nextTick();
        state.popperInstance = createPopper(triggerNode.value!, popperNode.value!, {
            placement: props.placement ?? 'bottom',
            modifiers: [
                preventOverflow,
                flip,
                // arrow,
                // offset,
                {name: "flip", enabled: !props.locked,},
                {name: "arrow", options: {padding: props.arrowPadding ?? 0},},
                {name: "offset", options: {offset: [props.offsetSkid ?? 0, props.offsetDistance],},},
            ],
        });

        // Update its position
        state.popperInstance?.update();
    };

    onBeforeUnmount(() => {
        state.popperInstance?.destroy();
    });

    return {
        ...toRefs(state),
        open,
        close,
    };
}

</script>

<template>
    <div
        class="inline-block"
        :style="interactiveStyle"
        @mouseleave="hover && closePopper()"
        ref="popperContainerNode"
    >
        <div class="alert alert-danger" v-if="invalid">INVALID</div>
        <div
            v-if="!customTrigger"
            ref="triggerNode"
            @mouseover="hover && openPopper()"
            @click="togglePopper"
            @focus="openPopper"
            @keyup.esc="_ => closePopper()"
            :class="triggerWrapperClass"
        >
            <slot name="trigger" :isOpen="modifiedIsOpen" :open="open" :close="close" :toggle="togglePopper" />
        </div>
        <div
            v-else
            ref="triggerNode"
            :class="triggerWrapperClass"
        >
            <slot name="trigger" :isOpen="modifiedIsOpen" :open="open" :close="close" :toggle="togglePopper" />
        </div>
        <Transition name="fade">
            <div
                @click="closePopper(closeOnClickInside)"
                v-show="shouldShowPopper"
                :class="twMerge('popper z-50 mt-1 rounded-md', wrapperClass)"
                ref="popperNode"
            >
<!--                :style="{'z-index': zIndex}"-->
<!--                <div class="z-50 mt-1 rounded-md shadow-lg"-->
<!--                     @click="onClickInside(close)">-->
                    <div :class="twMerge('rounded-md max-w-[95vw] flex flex-col', contentClass)">
                        <slot name="content" :close="close" :isOpen="modifiedIsOpen">
                            {{ content }}
                        </slot>
                    </div>
<!--                </div>-->
                <div class="popper-arrow" data-popper-arrow></div>
            </div>
        </Transition>
    </div>
</template>

<style>
.popper {
    transition: background 250ms ease-in-out;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.popper-arrow,
.popper-arrow::before {
    transition: background 250ms ease-in-out;
    position: absolute;
    width: 10px;
    height: 10px;
    box-sizing: border-box;
}

.popper-arrow {
    visibility: hidden;
}

.popper-arrow::before {
    visibility: visible;
    content: "";
    transform: rotate(45deg);
}

/* Top arrow */
.popper[data-popper-placement^="top"] > .popper-arrow {
    bottom: -5px;
}

/* Bottom arrow */
.popper[data-popper-placement^="bottom"] > .popper-arrow {
    top: -5px;
}

/* Left arrow */
.popper[data-popper-placement^="left"] > .popper-arrow {
    right: -5px;
}

/* Right arrow */
.popper[data-popper-placement^="right"] > .popper-arrow {
    left: -5px;
}
</style>
