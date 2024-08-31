<script setup lang="ts">

import {ref, watch} from "vue";
type ClassF = ((open: boolean) => string);

const show = defineModel<boolean>('show', {
    default: false
});

const props = defineProps<{
    text?: string,
    classes: string|ClassF|[string, ClassF],
    beforeShow?: () => Promise<boolean>,
}>();

defineEmits<{
    'toggle' : [],
}>()

watch(() => show.value, () => {
    cls.value = generateCls();
})

function generateCls(){
    const cls = props.classes;
    if(typeof cls === 'string'){
        return cls;
    }
    if(!Array.isArray(cls)) {
        return cls(show.value);
    }
    return cls[0] + ' ' + cls[1](show.value);
}

const cls = ref(generateCls());

function toggle(){
    if(show.value || !props.beforeShow){
        show.value = !show.value;
    }else{
        props.beforeShow().then((res) => {
            if(res)
                show.value = !show.value;
        })
    }
    // cls.value = generateCls();
}

</script>

<template>
    <button type="button" @click.prevent.stop="toggle" :class="cls">
        <slot>
            {{text}}
        </slot>
    </button>
</template>