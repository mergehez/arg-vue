<script setup lang="ts">
import {ref} from "vue";
import LoadingButton from "./LoadingButton.vue";

const props = withDefaults(defineProps<{
    // tag?: string,
    clickFunc: Function,
    svgSize?: string,
    hideIcOnLoad?: boolean,
    icClass?: string
}>(), {
    hideIcOnLoad: true,
})

const loading = ref(false);
function onClicked(){
    loading.value = true;
    props.clickFunc()
        .finally(() => {
            loading.value = false;
        });
}
defineExpose({onClicked})
</script>

<template>
    <LoadingButton v-bind="props" :loading="loading" @click.prevent="onClicked">
        <slot />
    </LoadingButton>
</template>
