<script setup lang="ts">

import {notifToastState as state, durSlide, durTilt, onMouseOver, onMouseOut} from './notif_toast_helpers';
import {onMounted, ref} from "vue";
import {overlayState} from "./overlay_utils";

const navSize = ref(60);
onMounted(() => {
    const nav = document.getElementById('nav') as HTMLElement;
    navSize.value = nav.clientHeight;
})
</script>

<template>
    <Teleport to="body">
        <div id="nav-notif" @click=" () => (state.onClick ? state.onClick() : {})"
             @mouseenter="onMouseOver()"
             @mouseleave="onMouseOut()"
             class="alert absolute border-2 py-1 text-center"
             :class="[
                 `alert-${state.type}`,
                 {'cursor-pointer': !!state.onClick, 'animation-tilt': state.show}
             ]"
             :style="{
                'top': -navSize + 'px',
                'margin-top': (!state.show ? `-${state.contentHeight}px` : `${navSize+5}px`),
                'min-height': '40px' ,
                'z-index': overlayState.modalZIndex,
                'left': '50%',
             }"
             v-html="state.message || state.show"
        ></div>
        <!--'top': -(navSize - state.contentHeight/2) + 'px',-->
                <!--'min-height': (navSize-24)+'px' ,-->
    </Teleport>
</template>

<style>
    #nav-notif{
        transform: translate(-50%, 0);
        transition: margin-top v-bind(durSlide + 'ms') ease-in-out;
    }

    .animation-tilt{
        -webkit-font-smoothing: antialiased;
        animation: tilt v-bind(durTilt + 'ms') linear ;
        animation-delay: v-bind(durSlide + 'ms');
        animation-iteration-count: 2;
    }

    @keyframes tilt {
        0%, 50%, 100% {
            transform: translate(-50%, 0%) rotate(0deg);
        }
        25% {
            transform: translate(-50%, -1%) rotate(2deg);
        }
        75% {
            transform: translate(-50%, -1%) rotate(-2deg);
        }
    }
</style>
