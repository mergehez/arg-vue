import dayjs from "dayjs";
// import DayjsTimezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/de";
import {reactive, Ref, ref, UnwrapRef} from "vue";
import latinizeFn from "latinize";
dayjs.extend(utc)
// dayjs.extend(DayjsTimezone)
// dayjs.tz.setDefault('Europe/Zurich')
// dayjs.locale('de')

export const latinize = (str: string) => latinizeFn(str);

export function strMaxLen(str: string, len: number){
    return str.length > len ? str.substring(0, len-3) + '...' : str;
}

export function uniqueId (len = 10) {
    const arr = new Uint8Array(len / 2);
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec => dec.toString(16).padStart(2, "0")).join('')
}
export function search(str: string, q: string){
    return latinize(str.toLowerCase()).includes(latinize(q.toLowerCase()));
}

export function arrToObj<T extends string|number, R>(arr: T[], map: (key:T) => R){
    return arr?.reduce((obj, key) => {
        return {
            ...obj,
            [key]: map(key)
        };
    }, {} as Record<T, R>);
}

export function revertObj<T extends string|number, R extends string|number>(obj: Record<T, R>){
    return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[value as R] = key as T;
        return acc;
    }, {} as Record<R, T>);
}

export function sizeToString(s: number){
    return s > 1024*1024 ? (s/1024/1024).toFixed(2) + ' MB' : (s > 1024 ? (s/1024).toFixed(2) + ' KB' : s + ' B')
}

export function createTabs<TKey extends string>(tabs: Record<TKey, string>, initial?: TKey, onTabChanged?: (t: TKey) => void, useQuery = true)
{
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
    toStringDate: (date: Date|string) =>  dayjs(date).format('DD.MM.YYYY'),
    toDate: (date: string) =>  dayjs(date).toDate(),
    toString: (date: Date|string|number) => {
        if(typeof date === 'number')
            return dayjs(date*1000).format('DD.MM.YYYY HH:mm');
        return dayjs(date).format('DD.MM.YYYY HH:mm');
    },
    toIsoString: (date: Date|string) => dayjs(date).toISOString(),
    asDayjs: (date: Date|string) => dayjs(date),
    max: (date: Date|string, date2: Date|string) => {
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