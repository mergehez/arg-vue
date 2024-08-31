<script setup lang="ts" generic="T">
import {computed} from "vue";
import {router} from "@inertiajs/vue3";
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
let pageCount = Math.ceil(props.pagination.total / props.pagination.per_page);
const pagesNumber = computed(() =>  {
    const curr = currPage.value;
    let pageNums = new Array<{num:any, pageTarget:any}>();
    const addPageNum = (num:any, pageTarget?:number) => pageNums.push({num, pageTarget: pageTarget || num});
    const addNumsToArr = (num:number) => {
        for (let i = 1; i < num+1; i++)
            pageNums.push({num:i, pageTarget: i});
    };
    if (pageCount <= maxNumCount) {	// all pages
        if(curr > 1)
            addNumsToArr(curr-1);
        addPageNum(curr);
        if(curr < pageCount)
            for(let $i = curr + 1 ; $i <= pageCount; $i++)
                addPageNum($i);
    }else {
        const sideCount = Math.ceil((maxNumCount-2)/3); // 5
        const middleSideCount = Math.ceil((sideCount-1)/2); // 2
        const minDiffForBoth = Math.ceil(sideCount+middleSideCount+2); // 9

        if(curr > minDiffForBoth && curr <= pageCount - minDiffForBoth){
            addNumsToArr(sideCount);
            addPageNum("...",  curr-middleSideCount-1);
            for (let i = curr-middleSideCount; i < curr+middleSideCount+1; i++)
                addPageNum(i);
            addPageNum("...", curr+middleSideCount+1);
            for(let $i = pageCount - sideCount+1; $i <= pageCount; $i++)
                addPageNum($i);
        }else if(curr <= pageCount / 2){
            const left = maxNumCount-sideCount-1;
            addNumsToArr(left);
            addPageNum("...", left+1);
            for(let $i = pageCount - sideCount+1; $i <= pageCount; $i++)
                addPageNum($i);
        }else{
            const right = maxNumCount-sideCount-1;
            addNumsToArr(sideCount-1);
            addPageNum("...", pageCount-right-1);
            for(let $i = pageCount - right; $i <= pageCount; $i++)
                addPageNum($i);
        }
    }
    return pageNums;
});

const isCurrent = (num:string|number) => currPage.value === num ;
const changePage = (page:number) => {
    const uri = new URL(props.pagination.first_page_url);
    uri.searchParams.set(props.queryParam, ''+page);
    router.visit(uri.toString(), {
        only: ['pageData'],
        onStart: () => {
            document.querySelector('#app main:first-of-type')?.scrollTo({top: 0, behavior: 'smooth'});
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
