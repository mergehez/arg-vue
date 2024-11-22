<script setup lang="ts">

import {TextInput} from "./index";
import {computed} from "vue";
import dayjs from "dayjs";
import {twMerge} from "tailwind-merge";

const modelValue = defineModel<string[] | string>();
// const props = withDefaults(defineProps<{
//     type?: 'date' | 'datetime' | 'time',
// }>(), {
//     type: 'datetime'
// });

const proxy = computed<string, string>({
    get: () => {
        let v = modelValue.value;
        if (typeof v === 'string') {
            v = JSON.parse(v);
            modelValue.value = v;
        }
        if (Array.isArray(v)) {
            return v.join('\n');
        }

        throw new Error('Invalid value');
    },
    set: (value: string) => {
        modelValue.value = value.split('\n').map(t => t.trim()).filter(v => v.length > 0);
    }
})

</script>

<template>
    <TextInput
        v-model="proxy"
        tag="textarea"
        :class="twMerge('flex-1 justify-start block', $attrs.class as any)"
    />
</template>