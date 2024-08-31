<script setup lang="ts">

defineProps<{open: boolean}>()
</script>

<template>
    <div class="grid transition-[grid-template-rows] duration-300 ease-in-out" :style="{'grid-template-rows': open ? '1fr' : '0fr'}">
        <div class="overflow-hidden">
            <slot></slot>
        </div>
    </div>
</template>
