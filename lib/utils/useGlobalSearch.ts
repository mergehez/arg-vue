import {computed, reactive, ref} from "vue";
import {useDebounceFn} from "@vueuse/core";
import {router} from "@inertiajs/vue3";
import TextInput from "../Components/Form/TextInput.vue";
import {arrToObj, uniqueId} from "./helpers";
import {api} from "./api_helpers";
import {defineStore} from "pinia";

type TSearchResult = Record<string, any>
export type TSearchResultSpecifics = Record<string, {
    route: string | ((t: TSearchResult) => string);
    labelProp?: string;
    ic: string;
    match: (t: TSearchResult) => boolean;
    selectLabel?: string;
}>;

export type TGlobalSearch = ReturnType<typeof useGlobalSearch>

export const refGlobalSearchInput = ref<InstanceType<typeof TextInput> | null>();
export const useGlobalSearch = defineStore('globalSearch', () => {
    const searchResultSpecifics = ref<TSearchResultSpecifics>({})
    const selectOptions = ref({} as Record<string, string>)
    const allRecentVisits = ref<TSearchResult[]>([]);

    const defaultOnSelected = (res: TSearchResult) => {
        for (const v of Object.values(searchResultSpecifics.value)) {
            if (v.match(res))
                return router.visit(typeof v.route === 'string' ? route(v.route, res.id) : v.route(res));
        }

        // fallback
        return router.visit(route('page.topic', res.id));
    };

    function setSearchResults(val?: TSearchResult[]) {
        _state.results = val;
        _state.resultsToShow = val == null ? [..._state.recentVisits] : [...(_state.results ?? [])];
    }

    const debouncedSearch = (ms?: number) => useDebounceFn(async () => {
        const q = _state.query;
        if (!q.trim().length) {
            // _state.warningText = __('peyvdivherikem3tipbe');
            return;
        }
        _state.warningText = '';
        return await api.get<TSearchResult[]>(route('api.search', {
            query: _state.query,
            include: _state.include,
        })).then((res) => {
            setSearchResults(res.data || []);
            _state.selectedRow = 0;
        }).catch(_ => [] as TSearchResult[]);
    }, ms)();

    async function executeGlobalSearch() {
        const q = _state.query;
        if (q.trim().length == 0) {
            _state.warningText = '';
            setSearchResults(undefined);
            return;
        }
        await debouncedSearch(q.length < 3 ? undefined : 500);
    }

    function goToSearchResult(res: TSearchResult) {
        if (!res) return;

        _state.onSelected(res);

        const existingIndex = allRecentVisits.value.findIndex(t => t.id == res.id && t.title == res.title);
        if (existingIndex > 0)
            allRecentVisits.value.splice(existingIndex, 1);
        if (existingIndex !== 0 && allRecentVisits.value.unshift(res) > 20)
            allRecentVisits.value.splice(20);
        localStorage.setItem('search_recent_visits', JSON.stringify(allRecentVisits.value));

        _state.show = false;
    }

    type TConfig = {
        onSelected?: typeof defaultOnSelected,
        include: string,
        readonlyInclude?: boolean,
    }

    function openSearchPopup(options?: TConfig) {
        if (options) {
            if (!options.include || Object.keys(selectOptions).findIndex(t => t !== options.include) == -1) {
                options.include = 'all';
            }
            if (options.onSelected)
                _state.onSelected = options.onSelected;
            _state.include = options.include;
            _state.readonlyInclude = options.readonlyInclude ?? false;
        }
        // _state.key = uniqueId();
        _state.show = true;
        console.log('openSearchPopup', _state, options);
    }

    const _state = reactive({
        tag: uniqueId(),
        key: uniqueId(),
        _show: false,
        show: computed({
            get: (): boolean => _state._show,
            set: (val) => {
                if (_state._show !== val) {
                    _state._show = val;
                    if (val) {
                        setTimeout(() => refGlobalSearchInput.value?.focus(), 500);
                        setSearchResults(undefined);
                    } else {
                        setTimeout(() => {
                            _state.query = '';
                            setSearchResults(undefined);
                            _state.selectedRow = 0;
                            _state.readonlyInclude = false;
                            _state.onSelected = defaultOnSelected;
                        }, 500);
                    }
                } else {
                    console.log('show same');
                }
            }
        }),
        query: '',
        results: [] as TSearchResult[] | undefined,
        resultsToShow: [] as TSearchResult[],
        recentVisits: [] as TSearchResult[],
        selectedRow: -1,
        warningText: '',
        _include: 'all',
        include: computed<string>({
            get: () => _state._include,
            set: (newVal: string) => {
                _state._include = newVal;
                if (newVal == 'all') {
                    _state.recentVisits = allRecentVisits.value.slice(0, 9);
                } else {
                    _state.recentVisits = allRecentVisits.value
                        .filter(t => {
                            return Object.keys(searchResultSpecifics.value).some(key => {
                                return key == newVal && searchResultSpecifics.value[key].match(t);
                            })
                        })
                        .slice(0, 9);
                }
                executeGlobalSearch();
            },
        }),
        readonlyInclude: false,
        showSelect: false,
        onSelected: defaultOnSelected,
    });
    function getSearchResultIcon(res: TSearchResult) {
        return Object.values(searchResultSpecifics.value)
            .find(t => t.match(res))?.ic ?? '';
    }
    function getSearchResultText(res: TSearchResult) {
        const val = res[Object.values(searchResultSpecifics.value).find(t => t.match(res))?.labelProp ?? 'title'];
        return 'tr' in res && res.tr ? window.__(val) : val;
    }
    return {
        state: _state,
        openSearchPopup,
        goToSearchResult,
        executeGlobalSearch,
        getSearchResultIcon,
        getSearchResultText,
        setSearchResults,
        selectOptions,
        allRecentVisits,
        searchResultSpecifics
    };
});

export function initGlobalSearch(opts: { searchResultSpecifics: TSearchResultSpecifics, dropdown: boolean }) {
    const globalSearch = useGlobalSearch((window as any).pinia);
    globalSearch.searchResultSpecifics = opts.searchResultSpecifics;
    globalSearch.selectOptions = {
        'all': 'all',
        ...arrToObj(Object.keys(globalSearch.searchResultSpecifics), t => globalSearch.searchResultSpecifics[t].selectLabel ?? t)
    };
    globalSearch.state.showSelect = opts.dropdown;

    globalSearch.allRecentVisits = JSON.parse(localStorage.getItem('search_recent_visits') ?? '[]') as TSearchResult[];
    // state.recentVisits = allRecentVisits.value.splice(0, 9)
    globalSearch.state.include = 'all';
    globalSearch.setSearchResults(undefined);
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
            globalSearch.state.include = 'all';
            globalSearch.state.show = true;
        } else if (e.key == 'Escape')
            globalSearch.state.show = false;
    })
}