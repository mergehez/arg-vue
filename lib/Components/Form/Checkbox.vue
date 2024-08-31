<script setup lang="ts">
import { computed } from 'vue';

const checked = defineModel<any[]|boolean|(0|1)>('checked');

const props = defineProps<{
    checked: any[]|boolean|(0|1),
    value?: number|string|boolean,
}>()

const proxyChecked = computed({
    get() {
        return typeof props.checked === 'number' ? props.checked === 1 : props.checked;
    },

    set(val) {
        if(typeof props.checked === 'number')
            checked.value = val ? 1 : 0;
        else
            checked.value = val;
    },
});
</script>


<template>
    <input
        v-model="proxyChecked"
        type="checkbox"
        :value="value"
        class="rounded dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
    >
</template>
