import type {InertiaForm} from "@inertiajs/vue3";

export type TFormProps<T extends object = Record<string, any>> = {
    form?: InertiaForm<T>,
    labelClass?: string,
    smFloat?: boolean,
}

export type FormLineProps = {
    label?: string,
    labelClass?: string,
    smFloat?: boolean,
    wrapperClass?: string,
    mt?: '0' | '1' | '2' | '3',
    type?: string,
    inputId?: string,
    error?: any,
    class?: string,
    modelValue?: any,
    name?: string, // to get value from inertia form. this component must be inside FormLayout and it must have :form set
}
