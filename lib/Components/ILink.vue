<script setup lang="ts">
import {Link as InertiaLink} from '@inertiajs/vue3'
import {InertiaLinkProps} from "@inertiajs/vue3";

defineProps<InertiaLinkProps>()
</script>

<template>
    <InertiaLink v-bind="$props">
        <slot></slot>
    </InertiaLink>
</template>