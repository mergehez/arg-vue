<!-- copy-paste-modify from https://github.com/SinanMtl/vue-rate/tree/next-->

<script setup lang="ts">
import {ref, watch, onBeforeMount, getCurrentInstance} from 'vue'

// const emit = defineEmits(["before-rate", "after-rate"]);
const modelVal = defineModel<number>('value',{ default: 0 });
const props = withDefaults(defineProps<{
    max: number,
    showCount?: boolean,
    required?: boolean,
    titles?: string[],
    readonly?: boolean,
    size?: 'lg' | 'xl' | 'xxl' | 'xxxl',
    responsive?: boolean
}>(), {max: 10, responsive: true, size: 'lg'})

const emit = defineEmits<{
    'rate': [val: number, onSuccess: () => void]
}>();

const currOver = ref(0)
const currRate = ref(0)

function convertValue(val: number) {
    return Math.max(0, Math.min(val, props.max));
}
function onOver (index: number) { if (!props.readonly) currOver.value = index }
function onOut () { if (!props.readonly) currOver.value = currRate.value }
const thisInstance = getCurrentInstance();
function setRate (index: number) {
    if (props.readonly) return false
    if(thisInstance?.vnode.props && 'onRate' in thisInstance.vnode.props){
        emit('rate', index, () => {
           currRate.value = index
           modelVal.value = currRate.value;
        });
    }else{
        currRate.value = index
        modelVal.value = currRate.value;
    }
}
watch(
    () => modelVal.value,
    (newVal) => {
        currRate.value = convertValue(newVal)
        currOver.value = convertValue(newVal)
    }
)

onBeforeMount(() => {
    modelVal.value = convertValue(modelVal.value);

    currRate.value = convertValue(modelVal.value)
    currOver.value = convertValue(modelVal.value)
})

function getStyle(i: number){ // 7.6
    if(i > currRate.value)
        return '--bg: var(--inactive);'

    if(i == currRate.value)
        return '--bg: var(--active);'

    let mod = currRate.value % 1;
    if(i+mod > currRate.value)
        return '--bg: var(--inactive);'

    if(i+mod < currRate.value)
        return '--bg: var(--active);'

    mod *= 100;
    return `--bg: linear-gradient(90deg, var(--active) 0%, var(--active) ${mod}%, var(--inactive) ${mod}%, var(--inactive) 90%);`;
}
</script>

<template>
    <div v-if="max > 0" class="Rate grid-cols-5" :class="responsive ? 'max-[420px]:grid' : ''">
        <input type="hidden" v-model="modelVal" :required="!!required">
        <template v-for="n in max" :key="n">
            <button
                type="button"
                class="Rate__star p-px decoration-0 text-color-600 col-span-1 max-sm:p-0"
                aria-label="rate button"
                :class="{'hover': n <= currOver}"
                :style="getStyle(n)"
                @mouseover="onOver(n)"
                @mouseout="onOut()"
                @click="setRate(n)"
                @keyup="onOver(n)"
                @keyup.enter="setRate(n)">
                <i class="ic ic-star" :class="size ? 'ic-'+size : ''"></i>
            </button>
        </template>
        <div class="Rate__view">
            <span v-if="!!showCount" class="count">{{ currOver }}</span>
            <span v-if="titles && titles.length > 0" class="desc">{{ titles[currOver - 1] }}</span>
        </div>
    </div>
</template>

<style>

.Rate .Rate__star{
    --inactive: theme('colors.gray.400');
    --active: theme('colors.amber.500');
}
.dark .Rate .Rate__star{
    --inactive: theme('colors.gray.500');
    --active: theme('colors.yellow.500');
}
.Rate__star > .ic:before{
    background: var(--bg);
}
.Rate:hover .Rate__star.hover > .ic:before {
    background: theme('colors.yellow.600');
}

.Rate__view .count,
.Rate__view .desc {
    display: inline-block;
    vertical-align: middle;
    padding: 7px
}
</style>
