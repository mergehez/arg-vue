<script setup lang="ts" generic="T">
import {computed} from "vue";
import {twMerge} from "tailwind-merge";
import {PaginatedData} from "../utils";

const props = withDefaults(defineProps<{
    pagination: PaginatedData<T>,
    class?: string,
    queryParam?: string,
    bg?: string,
    bgHover?: string,
}>(), {
    queryParam: 'rupel',
    bg: 'bg-x2',
    bgHover: 'hover:bg-x3',
});

const emit = defineEmits(['paginate']);

const currPage = computed(() => props.pagination.current_page);

const maxNumCount = 8;
/*
01 02 03 '04' 05 06 ... 33 34 35
01 02 03 ... 13 '14' 15 ... 33 34 35
01 02 03 ... 30 31 '32' 33 34 35
*/
let pageCount = props.pagination.last_page;
const pagesNumber = computed(() =>  {
    const curr = currPage.value;


    if (pageCount <= maxNumCount) {	// all pages
        return Array.from({length: pageCount}, (_, i) => i+1)
            .map(num => ({num, pageTarget: num}));
    }


    const all = {
        beforeDots: [] as number[],
        dotBefore: {num: -1},
        beforeCurr: curr > 1 ? [curr-1] : [],
        afterCurr: curr < pageCount ? [curr+1] : [],
        dotAfter: {num: -1},
        afterDots: [] as number[],

        toResult: () => [
            ...all.beforeDots,
            all.dotBefore,
            ...all.beforeCurr,
            curr,
            ...all.afterCurr,
            all.dotAfter,
            ...all.afterDots
        ].map(target => ({
            num: typeof target === 'object' ? "..." : target,
            pageTarget: typeof target === 'object' ? target.num : target
        })).filter(({pageTarget}) => pageTarget !== -1)
    }
    const minDotsSide = 2;

    const hasLeftDots = curr >= maxNumCount - minDotsSide;
    const hasRightDots = curr <= pageCount - maxNumCount + minDotsSide;

    if(hasLeftDots){
        all.beforeDots = [1, 2];
    }
    if(hasRightDots){
        all.afterDots = [pageCount-1, pageCount];
    }

    if(hasLeftDots && hasRightDots) {
        all.dotBefore.num = curr - 2;
        all.dotAfter.num = curr + 2;

        return all.toResult();
    }

    const sideRemain = maxNumCount - minDotsSide - 1;

    if(!hasLeftDots){
        all.beforeCurr = Array.from({length: curr - 1}, (_, i) => i+1);
        if(curr < sideRemain - 1)
            all.afterCurr = Array.from({length: sideRemain - curr}, (_, i) => curr + i + 1);
        all.dotAfter.num = sideRemain + 1;
    }else{
        all.afterCurr = Array.from({length: pageCount - curr}, (_, i) => curr + i + 1);
        if(curr > pageCount - sideRemain)
            all.beforeCurr = Array.from({length: sideRemain - (pageCount - curr)}, (_, i) => curr - i - 1).reverse();
        all.dotBefore.num = pageCount - sideRemain - 1;
    }

    return all.toResult();
});

const isCurrent = (num:string|number) => currPage.value === num ;
const changePage = (page:number) => {
    const uri = new URL(props.pagination.last_page_url);
    uri.searchParams.set(props.queryParam, ''+page);
    window.router.visit(uri.toString(), {
        only: ['pageData'],
        onStart: () => {
            // document.querySelector('#app main:first-of-type')?.scrollTo({top: 0, behavior: 'smooth'});
        }

    })
    emit('paginate');
};


const btnClass = 'px-2 lg:px-3 h-full text-base leading-tight border-none';
</script>

<template>
    <nav v-if="pageCount > 1" aria-label="Pagination" :class="twMerge('my-4 flex items-center justify-center', props.class)">
        <ul :class="'flex justify-center w-auto -space-x-px h-8 text-base border border-x3 divide-x divide-x4 rounded-md ' + bg">
            <li >
                <button :disabled="currPage === 1"  v-on:click.prevent="changePage(currPage-1)"
                        :class="[btnClass, currPage !== 1 ? bgHover : '']">
                    <span class="sr-only">Previous</span>
                    «
                </button>
            </li>
            <li v-for="{num, pageTarget} in pagesNumber">
                <button :disabled="isCurrent(num)" v-on:click.prevent="changePage(pageTarget)"
                        :class="[btnClass, !isCurrent(num) ? bgHover : '', isCurrent(num) ? 'text-green-600':'']" >
                    {{ num }}
                </button>
            </li>
            <li>
                <button :disabled="currPage === pagination.last_page" v-on:click.prevent="changePage(currPage+1)"
                        :class="[btnClass, currPage !== pagination.last_page ? bgHover : '']">
                    <span class="sr-only">Next</span>
                    »
                </button>
            </li>
        </ul>
    </nav>
</template>
