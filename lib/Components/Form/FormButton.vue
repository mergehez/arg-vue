<script setup lang="ts">

import LoadingButton from "../LoadingButton.vue";
import {InertiaForm} from "@inertiajs/vue3";

withDefaults(defineProps<{
    form: InertiaForm<any>,
    icon?: string,
    text?: string,
}>(), {
    icon: 'icon icon-[mdi--content-save] text-lg'
});

const __ = window.__;
</script>

<template>
    <LoadingButton
        type="submit"
        :loading="form.processing"
        :disabled="!form.isDirty"
        class="btn btn-success py-px gap-1 self-end"
        :class="form.isDirty ? 'opacity-100': '!opacity-30'">
        <span v-if="!form.processing" :class="icon" class=" pointer-events-none"></span>
        <span class="py-1 pointer-events-none">{{ text ?? __('save') }}</span>
    </LoadingButton>
</template>