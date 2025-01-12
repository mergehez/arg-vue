<script setup lang="ts">
import {twMerge} from "tailwind-merge";
import {ref} from "vue";
import {TArgVueTrKeys, uniqueId} from "../../utils";

const props = withDefaults(defineProps<{
    trFunc?: (key: TArgVueTrKeys) => string,
    translate?: boolean,
    class?: string,
    searchable?: boolean,
} & ({
    options: Record<number, string>,
    numberKey: boolean
} | {
    options: Record<string, string>,
    numberKey?: false
})>(), {
    trPrefix: '',
    searchable: true,
    translate: true,
    trFunc: (t: any) => window.__(t),
});
const modelValue = defineModel<any>();

function onChange(event: Event) {
    let val: string | number = (event.target as HTMLSelectElement).value;
    if (props.numberKey) {
        val = parseInt(val);
    }
    modelValue.value = val;
}

const id = uniqueId();

function getText(text: any) {
    return props.translate ? props.trFunc(text) : text;
}

const query = ref('');
</script>

<template>
    <label
        :for="id"
        :class="twMerge('form-control pl-3 py-1.5 pr-7 relative justify-start', props.class)"
    >
        <select aria-labelledby="categories" :value="modelValue" @change="onChange" :id="id"
                class="absolute inset-0 w-full opacity-0 cursor-pointer w-24 md:w-auto px-0">
            <option v-for="(text, key) in options" :value="key" :selected="modelValue == key">{{ getText(text) }}</option>
        </select>
        <!--<template v-if="searchable">-->
        <!--    <TextInput v-model="query" class="absolute inset-0 cursor-pointer w-full h-full  px-0" placeholder="Search"/>-->
        <!--</template>-->
        <!--<template v-else>-->
        <span v-if="options[modelValue]">{{ getText(options[modelValue]) }}</span>
        <span v-else class="opacity-0">A</span>
        <i class="icon icon-[mdi--chevron-down] right-2 text-lg absolute pointer-events-none select-none"></i>
        <!--</template>-->
    </label>
</template>