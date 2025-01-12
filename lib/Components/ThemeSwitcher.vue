<script setup lang="ts">

import NavButton from "./NavButton.vue";

defineProps<{
    icClass?: string,
}>()


function toggleTheme() {
    window.themeManager.toggle();
}

const __ = window.__;
</script>

<template>
    <NavButton
        class="py-2 px-1.5 md:px-2"
        :title="__('theme_switcher')"
        @click="toggleTheme"
    >
        <i class="icon icon-[mingcute--sun-fill] dark:hidden" :class="icClass"></i>
        <i class="icon icon-[mingcute--moon-fill] dark:inline hidden" :class="icClass"></i>
    </NavButton>
</template>