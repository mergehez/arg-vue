import dayjs from "dayjs";
// import DayjsTimezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/de";
import {reactive, ref} from "vue";
import latinizeFn from "latinize";
import {ConfirmModalConfigurable, confirmModalState} from "../Components";
import {initGlobalSearch} from "./useGlobalSearch";
import {defineStore} from "pinia";

dayjs.extend(utc)
// dayjs.extend(DayjsTimezone)
// dayjs.tz.setDefault('Europe/Zurich')
// dayjs.locale('de')

type ArgVueInitializeConfig = {
    windowOverrides: {
        translations: typeof window.translations;
        __: typeof window.__;
        usePage: typeof window.usePage;
        useForm: typeof window.useForm;
        router: typeof window.router;
    },
    confirmModalState?: () => ConfirmModalConfigurable,
    globalSearch?: () => Parameters<typeof initGlobalSearch>[0]
}

export function argVueInitializer(config: ArgVueInitializeConfig) {
    window.translations = config.windowOverrides.translations;
    window.__ = config.windowOverrides.__;
    window.usePage = config.windowOverrides.usePage;
    window.useForm = config.windowOverrides.useForm;
    window.router = config.windowOverrides.router;

    if (config.confirmModalState) {
        const state = config.confirmModalState();
        confirmModalState.defaultTitle ??= state.defaultTitle;
        confirmModalState.defaultTextConfirm ??= state.defaultTextConfirm;
        confirmModalState.defaultTextCancel ??= state.defaultTextCancel;
    }

    if (config.globalSearch) {
        initGlobalSearch(config.globalSearch());
    }
}


export const latinize = (str: string) => latinizeFn(str);

export function strMaxLen(str: string, len: number) {
    return str.length > len ? str.substring(0, len - 3) + '...' : str;
}

export function uniqueId(len = 10) {
    const arr = new Uint8Array(len / 2);
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec => dec.toString(16).padStart(2, "0")).join('')
}

export function search(str: string, q: string) {
    if (typeof str === 'number') str = (str as any).toString();
    if (typeof q === 'number') q = (q as any).toString();
    return latinize(str.toLowerCase()).includes(latinize(q.toLowerCase()));
}

type TArrayItem<TArray> = TArray extends (infer T)[] ? T : never;

export function arrToObj<TArr extends string[] | number[], R>(arr: TArr, map: (key: TArrayItem<TArr>) => R) {
    return arr?.reduce((obj, key) => {
        return {
            ...obj,
            [key]: map(key as TArrayItem<TArr>)
        };
    }, {} as Record<TArrayItem<TArr>, R>);
}

function abc<TKey extends string | number, T extends Record<TKey, string | number>>(e: T,): T;
function abc<TKey extends string | number, T extends Record<TKey, string | number>, Filter extends (key: TKey, val: any) => boolean>(e: T, filter: Filter,): Partial<T>;
function abc<
    TKey extends string | number,
    T extends Record<TKey, string | number>,
    Filter extends ((key: TKey, val: any) => boolean) | undefined
>(
    e: T,
    filter?: Filter,
) {
    const obj = {} as (Filter extends undefined ? T : Partial<T>);
    let entries = Object.entries(e);
    if (filter) {
        entries = entries.filter(([key, val]) => filter(key as any, val));
    }
    return entries.reduce((acc, [key, val]) => {
        return {
            ...acc,
            [key]: val,
        };
    }, obj);
}

enum TestEnum {
    foo = 'bar',
    xyz = 'abc'
}

export function objFlip<
    TKey extends string | number,
    TValue extends string | number,
>(o: Record<TKey, TValue>) {
    return Object.entries(o).reduce((acc, [key, value]) => {
        return {
            ...acc,
            [value as TValue]: key
        }
    }, {} as Record<TValue, TKey>);
}

type TSort<TKey> = (a: { key: TKey, val: any }, b: { key: TKey, val: any }) => number

export function enumToObj<
    TKey extends string, TValue, ValueAsKey extends boolean = true,
>(e: Record<TKey, TValue>, valueAsKey?: ValueAsKey, sort?: TSort<TKey>) {
    return enumToObjFilter(e, valueAsKey, undefined, sort);
}

export function enumToObjFilter<TKey extends string, TValue, ValueAsKey extends boolean = true>(
    e: Record<TKey, TValue>,
    valueAsKey?: ValueAsKey,
    filter?: ((key: TKey, val: TValue) => boolean),
    sort?: TSort<TKey>
) {
    const obj = {};
    let entries = Object.entries(e)
        .filter(([key, val]) => Number.isNaN(Number(key)));

    if (filter) {
        entries = entries.filter(([key, val]) => filter(key as any, val as TValue));
    }

    if (sort) {
        entries = entries.sort((a, b) => sort({key: a[0] as any, val: a[1]}, {key: b[0] as any, val: b[1]}));
    }

    return entries
        .reduce((acc, [key, val]) => {
            return {
                ...acc,
                [valueAsKey ? val as any : key]: valueAsKey ? key : val
            }
        }, obj) as ValueAsKey extends true
        ? Record<TValue extends string ? string : number, TKey>
        : Record<TKey, TValue>
}

export function keyByValue<TKey extends string | number, TValue>(e: Record<TKey, TValue>, value: TValue) {
    return Object.entries(e).find(([key, val]) => val === value)?.[0] as TKey;
}

export function objArrToObj<T extends Record<string, any>, TKey extends string | number, R>(
    arr: T[],
    keyGetter: (t: T) => TKey,
    valueGetter: (t: T) => R
) {
    return arr?.reduce((obj, key) => {
        const k = keyGetter(key);
        return {
            ...obj,
            [k]: valueGetter(key)
        };
    }, {} as Record<TKey, R>);
}

export function revertObj<T extends string | number, R extends string | number>(obj: Record<T, R>) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[value as R] = key as T;
        return acc;
    }, {} as Record<R, T>);
}

export function sizeToString(s: number) {
    return s > 1024 * 1024 ? (s / 1024 / 1024).toFixed(2) + ' MB' : (s > 1024 ? (s / 1024).toFixed(2) + ' KB' : s + ' B')
}

export function createTabs<TKey extends string>(tabs: Record<TKey, string>, initial?: TKey, onTabChanged?: (t: TKey) => void, useQuery = true) {
    initial ??= (useQuery ? new URL(window.location.href).searchParams.get('tab') as any : Object.keys(tabs)[0]) ?? Object.keys(tabs)[0];

    const x = reactive({
        categories: tabs,
        selection: initial! as TKey,
        onTabChanged: (onTabChanged ?? ((t: TKey) => x.selection = t as any)),
    })

    return x;
}

function getScrollParent(node: HTMLElement | null) {
    if (node == null) {
        return null;
    }

    if (node.scrollHeight > node.clientHeight) {
        return node;
    } else {
        return getScrollParent(node.parentNode as HTMLElement);
    }
}

export const hasClipboard = 'clipboard' in navigator;

export async function copyToClipboard(text: string) {
    console.log('copying', text)
    await navigator.clipboard.writeText(text);
    return true;
}

export const dt = {
    toStringDate: (date: Date | string) => dayjs(date).format('DD.MM.YYYY'),
    toDate: (date: string) => dayjs(date).toDate(),
    toString: (date: Date | string | number) => {
        if (typeof date === 'number')
            return dayjs(date * 1000).format('DD.MM.YYYY HH:mm');
        return dayjs(date).format('DD.MM.YYYY HH:mm');
    },
    toIsoString: (date: Date | string) => dayjs(date).toISOString(),
    asDayjs: (date: Date | string) => dayjs(date),
    max: (date: Date | string, date2: Date | string) => {
        const d1 = dayjs(date), d2 = dayjs(date2);
        return d1.isAfter(d2) ? d1.toDate() : d2.toDate();
    },
}


export function stripHTML(str: string, maxLength?: number) {
    const parsedHTML = new DOMParser().parseFromString(str, "text/html");
    const text = parsedHTML.body.textContent || '';

    if ((!maxLength || text.length < maxLength) && /(<([^>]+)>)/gi.test(text)) {
        return stripHTML(text);
    }

    return text?.replace(/\n/g, ' ')?.substring(0, maxLength) || "";
}


export function useLoadingButton() {
    return defineStore(uniqueId(), () => {
        const isLoading = ref(false);

        return {
            isLoading,
            startLoading() {
                isLoading.value = true;
            },
            stopLoading() {
                isLoading.value = false;
            }
        }
    })();
}