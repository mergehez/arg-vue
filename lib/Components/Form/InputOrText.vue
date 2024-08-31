<script setup lang="ts">

const props = defineProps<{
    type: 'input' | 'select' | 'textarea' | 'checkbox' | '',
    options?: any,
    rows?: any,
    placeholder?: string,
    modelValue: any,
    error?: any
}>();
const finalOptions: Record<string, string> = Array.isArray(props.options) ? Object.assign({},
    ...Array.from(props.options, v => ({[v]: v}))
) : props.options;

defineEmits(['update:modelValue'])
</script>

<template>
    <span v-if="type === ''">{{ modelValue }}</span>
    <template v-else>
        <component v-if="type == 'input' || type == 'textarea'"
                   :is="type"
                   class="w-full text-sm btn btn-light hover:bg-white dark:hover:bg-gray-800 px-3 py-1"
                   :value="modelValue"
                   :rows="rows"
                   :placeholder="placeholder"
                   @input="(v: KeyboardEvent) => $emit('update:modelValue', (v.target as HTMLInputElement|HTMLTextAreaElement).value)"/>

        <select v-else-if="type == 'select'" class="w-full text-sm btn btn-light hover:bg-white dark:hover:bg-gray-800 px-3 py-1"
                :value="modelValue"
                @change="v => $emit('update:modelValue', (v.target as HTMLSelectElement).value)">
            <option v-for="k in Object.keys(finalOptions)" :value="k" :selected="k == modelValue">{{ finalOptions[k] }}</option>
        </select>

        <input v-else-if="type == 'checkbox'" type="checkbox"
               class="w-6 h-6 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-0 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
               :checked="!!modelValue" @change="v => $emit('update:modelValue', (v.target as HTMLInputElement).checked)">

        <div v-if="error" class="text-red-500">{{ error }}</div>
    </template>
</template>

<style scoped>

</style>
