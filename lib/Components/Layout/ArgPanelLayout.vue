<script setup lang="ts">
import {NavButton, ThemeSwitcher, TopAppLayout} from "../";
import {Link} from "@inertiajs/vue3";
import {computed, ref, watch} from "vue";

const props = withDefaults(defineProps<{
    hideMenuIcons?: boolean,
    menus: { name: string, route: string, icon: string }[],
    menuWidths?: string[],
    onRouteChanged?: (route: string) => void,
    isCurrentRoute?: (m: { name: string, route: string, icon: string }) => boolean,
}>(), {
    hideMenuIcons: false,
    menuWidths: () => ['200', '100', '0'],
})

const menuMode = ref(localStorage.getItem('menuMode') ?? props.menuWidths[0]);
// const lastMenuWidth = localStorage.getItem('menuWidth');
const menuWidth = computed(() => Math.max(100, parseInt(menuMode.value)))
watch(menuMode, () => {
    localStorage.setItem('menuMode', menuMode.value);
})

function changeMenuMode() {
    const ws = props.menuWidths;
    const i = ws.indexOf(menuMode.value);
    menuMode.value = ws[(i + 1) % ws.length];
}

const __ = window.__;
</script>

<template>
    <TopAppLayout @route-changed="onRouteChanged">
        <div class="h-screen flex flex-col bg-x2 relative overflow-y-auto">
            <!--<div class="w-screen h-screen flex flex-col bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">-->
            <nav id="nav" class="flex px-5 py-2 bg-x0 items-center gap-2 shadow dark:shadow-stone-800">
                <NavButton @click="changeMenuMode"
                           title="frontend">
                    <i class="icon icon-[mingcute--menu-fill] text-lg"></i>
                </NavButton>
                <div class="flex items-center gap-1 text-indigo-800 font-bold pr-4 border-r border-x5 pl-1">
                    <span class="icon icon-[mdi--settings] text-lg"></span>
                    <Link class="rounded transition-colors duration-300" :href="route('panel.settings')">Panel</Link>
                </div>
                <NavButton :href="route('page.home')"
                           class="py-1 px-1.5 md:px-2 gap-1 text-sm"
                           title="frontend">
                    <span class="icon icon-[mdi--home] text-lg"></span>Frontend
                </NavButton>

                <i class="flex-1"></i>

                <slot name="nav-right"></slot>

                <ThemeSwitcher/>
                <NavButton :href="route('api.logout')"
                           class="py-1 px-1.5 md:px-2 gap-1 text-gray-700 ml-auto"
                           title="frontend">
                    <span class="icon icon-[mdi--logout] text-lg"></span>
                </NavButton>
            </nav>

            <div class="flex-1 flex p-3 gap-3 relative overflow-y-auto">
                <div
                    class="flex flex-col px-2 py-3 bg-x0 rounded-lg duration-300 gap-px"
                    :style="{
                        width: menuWidth + 'px',
                        marginLeft: menuMode !== '0' ? '0' : (-menuWidth-12) + 'px',
                        transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
                    }"
                >
                    <template v-for="m in menus" :key="m.route">
                        <!--class="p-2 flex items-center font-bold gap-1 hover:text-green-400 border border-transparent"-->
                        <Link
                            class="btn btn-hover  py-2  gap-2 font-normal justify-start  transition-all duration-300"
                            :class="{
                                'px-4 text-base': menuMode === '200',
                                'px-2 text-sm': menuMode === '100',
                                'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-md': isCurrentRoute?.(m) ?? false,
                            }"
                            :href="route(`panel.${m.route}`)"
                        >
                            <span v-if="!hideMenuIcons" class="icon text-lg" :class="m.icon"></span>
                            <span>{{ __(m.name as any) }}</span>
                            <!--<span class="text-2xs ml-auto pl-1">{{ page.props.navStats[arr[1] || k] }}</span>-->
                        </Link>
                    </template>
                    <i class="flex-1"></i>
                    <slot name="sidebar-bottom"></slot>
                    <!--<div class="text-center text-sm">{{ page.props.app_version }}</div>-->
                    <!--<div class="text-center text-sm">PHP v{{ page.props.php_version }}</div>-->
                </div>
                <div class="flex-1 flex flex-col p-5 bg-x0 rounded-lg overflow-y-auto">
                    <slot/>
                </div>
            </div>
        </div>
    </TopAppLayout>
</template>
