<script setup lang="ts">

import LoadingButton from "../LoadingButton.vue";
import {InertiaForm} from "@inertiajs/vue3";

withDefaults(defineProps<{
    form: InertiaForm<any>,
    icon?: string,
}>(), {
    icon: 'icon icon-[mdi--content-save] text-lg'
});

const __ = window.__;

function aa(e: any) {
    console.log(e)
}
</script>

<template>
    <div class="flex items-center justify-end gap-2">
        <span
            :class="form.recentlySuccessful ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'"
            class="text-sm font-medium italic text-green-400 transition-opacity duration-500"
        >
            {{ __('saved_successfully') }}
        </span>
        <LoadingButton
            type="submit"
            :loading="form.processing"
            :disabled="!form.isDirty"
            class="btn btn-success py-px gap-1 self-end"
            :class="form.isDirty ? 'opacity-100': '!opacity-30'">
            <span v-if="!form.processing" :class="icon" class=" pointer-events-none"></span>
            <span class="py-1 pointer-events-none">{{ __('save') }}</span>
        </LoadingButton>
    </div>
</template>