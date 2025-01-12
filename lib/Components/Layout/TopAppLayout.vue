<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import {Head} from "@inertiajs/vue3";
import {globalKeyDownListener} from "../../utils";
import GlobalSearchPopup from "../Overlays/GlobalSearchPopup.vue";
import NotificationToast from "../Overlays/NotificationToast.vue";
import ConfirmationModal from "../Overlays/ConfirmationModal.vue";

defineProps<{
    contentClass?: string
}>()

const emit = defineEmits<{
    routeChanged: [route: string]
}>();

emit('routeChanged', route().current() as string);

const isLoading = ref(false);
let timeout: any = undefined;
window.router.on('start', () => {
    timeout = setTimeout(() => isLoading.value = true, 1000)
})
const currUrl = ref(window.location.href.replace('www.', ''));
window.router.on('finish', () => {
    clearTimeout(timeout)
    isLoading.value = false;
    emit('routeChanged', route().current() as string);

    currUrl.value = window.location.href.replace('www.', '');
})

onMounted(globalKeyDownListener.onLayoutMounted)
onBeforeUnmount(globalKeyDownListener.onLayoutUnmounted)

// const {state: globalSearchState} = useGlobalSearch();
</script>

<template>
    <div :class="contentClass ?? 'w-screen h-screen flex flex-col'">
        <Head>
            <!--<link rel="canonical" :href="currUrl" />-->
        </Head>

        <slot/>
    </div>

    <GlobalSearchPopup/>
    <NotificationToast/>
    <ConfirmationModal/>

    <div class="absolute inset-0 flex items-center justify-center bg-x0 z-[1000] !bg-opacity-30" v-if="isLoading"></div>
</template>
