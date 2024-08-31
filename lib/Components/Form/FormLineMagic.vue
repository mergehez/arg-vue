<script setup lang="ts">
import {computed, inject, Ref} from "vue";
import FormLine from "./FormLine.vue";
import {FormLineProps, TFormProps} from "./form_helpers";

// this component can only be used inside FormLayout component
const props = withDefaults(defineProps<Omit<FormLineProps, 'modelValue'> & {
    name: string,
    textOnly?: boolean
}>(), {
    smFloat: undefined,
})
const emit = defineEmits(['change'])

const formProps = inject<Ref<TFormProps>>('formProps')!;
const _form = computed(() => formProps.value.form!);
</script>

<template>
    <FormLine v-bind="props"
              :model-value="_form[name]"
              @update:modelValue="(t: any) => $emit('change', _form[name] = t)"
              :error="_form.errors[name] ?? ''"
              :sm-float="smFloat ?? formProps.smFloat"
              :label-class="formProps.labelClass">
        <template v-if="textOnly">
            <span class="flex-1">
                <slot>{{ _form[name] }}</slot>
            </span>
        </template>
        <template v-else>
            <slot></slot>
        </template>
        <template #after-input>
            <slot name="after-input">
            </slot>
        </template>
    </FormLine>
</template>
