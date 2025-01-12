<script setup lang="ts">
import {uniqueId} from "../../utils/helpers";
import InputError from "./InputError.vue";
import TextInput from "./TextInput.vue";
import {twMerge} from "tailwind-merge";
import {FormLineProps} from "./form_helpers";
import {computed} from "vue";

defineOptions({
    inheritAttrs: false,
})
const props = withDefaults(defineProps<FormLineProps>(), {
    inputId: _ => uniqueId(10),
})

const _mt = computed(() => props.mt ?? (props.smFloat ? '3' : '2'))
const floatingLabelClass = 'max-sm:w-full';
// const floatingLabelClass = 'max-sm:bg-x1 max-sm:font-bold max-sm:absolute max-sm:text-xs max-sm:-top-2.5 max-sm:left-3 max-sm:opacity-80 z-10 max-sm:w-auto';
const _labelClass = computed(() => twMerge(props.labelClass ?? 'w-24', (props.smFloat ? floatingLabelClass : 'max-sm:w-20')))
const emit = defineEmits(['update:modelValue'])
</script>

<template>
    <div :class="[twMerge('flex items-start justify-start relative', wrapperClass, (_mt ? `mt-${_mt}` : '')), smFloat ? 'floating-label' : '']">
        <label v-if="label" :class="_labelClass" :for="inputId">{{ label }}</label>
        <slot>
            <TextInput
                :tag="$attrs.tag as any ?? 'input'"
                :type="$attrs.type as any ?? 'text'"
                :required="$attrs.required ?? false"
                :model-value="modelValue ?? ''"
                :rows="$attrs.rows"
                @update:model-value="(t: string) => $emit('update:modelValue', t)"
                :class="twMerge('flex-1', $props.class)"
                :id="inputId"/>
        </slot>
        <!--        <label v-if="label && smFloat" :class="floatingLabelClass" :for="inputId">{{ label }}</label>-->
        <slot name="after-input"></slot>
    </div>
    <InputError :message="error" html :label-class="labelClass"/>
</template>


<style lang="scss">
@media screen and (max-width: theme('screens.sm')) {
    .floating-label {
        flex-direction: column;
    }
    .floating-label .flex-1 {
        //background: red !important;
        width: 100%;
    }
}
</style>
