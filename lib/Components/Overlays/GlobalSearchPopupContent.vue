<script setup lang="ts">

import TextInput from "../../Components/Form/TextInput.vue";
import FormSelect from "../Form/FormSelect.vue";
import {refGlobalSearchInput, useGlobalSearch} from "../../utils";
import {computed} from "vue";

defineProps<{
    autoFocus?: boolean,
}>()

const globalSearch = useGlobalSearch();
const state = computed(() => globalSearch.state);
const { goToSearchResult, executeGlobalSearch, getSearchResultIcon, getSearchResultText } = globalSearch;

function navigate(e: KeyboardEvent) {
    if (e.key == 'Enter') {
        if(e.type == 'keyup'){
            globalSearch.goToSearchResult(state.value.resultsToShow[state.value.selectedRow])
        }
        return;
    }
    const resLen = state.value.resultsToShow.length;
    if (resLen < 2 || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp'))
        return;

    if (e.key == 'ArrowDown')
        state.value.selectedRow = (state.value.selectedRow + resLen + 1) % resLen;
    else
        state.value.selectedRow = (state.value.selectedRow + resLen - 1) % resLen;
    e.preventDefault();
    return false;
}

const trans = window.__;
</script>

<template>
    <div class="flex form-control bg-x1 overflow-hidden p-0 border-x6">
        <div class="relative w-full flex items-center">
            <FormSelect
                v-if="state.showSelect"
                :disabled="state.readonlyInclude"
                :options="globalSearch.selectOptions"
                v-model="state.include"
                translate
                :tr-func="trans"
                name="search-type"
                aria-label="search type"
                class="pr-7 pl-4 bg-transparent !ring-0 rounded-none border-0 border-x6" style="border-right-width: 1px;"/>
            <TextInput
                type="search"
                :id="autoFocus ? 'search-dropdown': ''"
                ref="refGlobalSearchInput"
                :autofocus="autoFocus"
                aria-autocomplete="none" autocomplete="off"
                v-model="state.query"
                @input="executeGlobalSearch"
                @keyup.enter="navigate"
                @keydown="navigate"
                class="z-10 bg-transparent dark:bg-transparent w-full text-base border-none rounded-none focus:ring-0"
                style="--webkit-appearance: none"
                :placeholder="trans('search')"/>
            <i class="absolute right-2 icon icon-[mingcute--search-line] text-lg opacity-50" v-if="!state.query">
                <span class="sr-only">Search</span>
            </i>
        </div>
    </div>

    <!--has warning-->
    <div v-if="state.warningText && state.query.length > 0" class="px-2 text-sm text-red-400 text-center">
        {{ state.warningText }}
    </div>

    <!--typed but has no result-->
    <div v-if="state.query.length > 0 && !state.resultsToShow.length" class="font-bold pl-2 text-indigo-400 pt-3 py-2 flex flex-col items-center gap-4">
        {{ trans('not_found') }}
    </div>

    <!--has search results or recent searches-->
    <div v-else-if="state.resultsToShow.length" class="font-bold pl-2 page.props.pageData.word my-2">
        {{ state.results?.length ? trans('search_results') : trans('recent_searches') }}
    </div>

    <!--didn't type anything and there are no recent searches-->
    <div v-else class="font-bold text-center pl-2 text-indigo-400 pt-3 py-2">
        {{ trans('no_recent_searches') }}
    </div>
    <div class="dark:bg-gray-800 rounded overflow-y-auto text-sm md:text-base border-t border-l border-card">
        <button v-for="(res, i) in state.resultsToShow"
                class="list-group-item text-left gap-1 ic relative px-3 border-b border-r border-card hover:bg-gray-700/70 cursor-pointer"
                :class="[{ 'bg-indigo-200 dark:bg-indigo-800': state.selectedRow == i}, getSearchResultIcon(res)]"
                @click="goToSearchResult(res)"
        >
                <span class="truncate pl-2 w-full">
                    {{ getSearchResultText(res) }}
                </span>
        </button>
    </div>
</template>