<script setup lang="ts">

import {router} from "@inertiajs/vue3";
import {LoadingButton} from "../";
import {ref} from "vue";

const __ = window.__;


const isLoading = ref(false);

function refresh() {
    isLoading.value = true;
    router.reload({
        only: ['pageData'],
        onFinish: () => {
            isLoading.value = false;
        },
    })
}
</script>

<template>
    <LoadingButton
        :loading="isLoading"
        svg-size="w-4"
        ic-class="icon icon-[mdi--refresh]"
        class="btn btn-light px-2 py-0.5 gap-1"
        @click.prevent="refresh">
        <slot>
            {{ __('refresh') }}
        </slot>
    </LoadingButton>
</template>
