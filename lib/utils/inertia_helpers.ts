import type {Page as InertiaPage} from "@inertiajs/core";
import {computed} from "vue";
import {TArgVueTrKeys} from "./required_tr_keys";

let page: TInertiaPage<any>;

export function changeLanguage(langKey: string) {
    usePage().props.localization.locale = langKey;
}

const __getByLocale: (locale: string) => Record<string, string> = (window as any).__getByLocale;
const translations = computed(() => __getByLocale(page.props?.localization.locale ?? 'en'));

type EnsureAllTypes<T extends string> = Exclude<TArgVueTrKeys, T> extends never
    ? T
    : { error: `Missing types: ${Exclude<TArgVueTrKeys, T>}` };

export function __base<T extends string>(
    key: EnsureAllTypes<T> extends T ? EnsureAllTypes<T> & T : EnsureAllTypes<T>,
    replace?: Record<string, string> | undefined,
): string {
    page ??= usePage()

    if (!key) return '';

    const trimmedKey = (key as T).trim() as T;
    if (!(trimmedKey in translations.value)) {
        return trimmedKey;
    }

    let translation = translations.value[trimmedKey] || trimmedKey;

    if (replace) {
        Object.keys(replace).forEach((replaceKey) => {
            translation = translation.replace(new RegExp(replaceKey, 'g'), replace[replaceKey]);
        });
    }

    return translation;
}

export interface TInertiaPagePropsAuth {
    // user?: TInertiaPagePropsAuthUser,
}

export interface TInertiaPagePropsAuthUser {
    id: number,
    email: string,
    name: string
}

export interface TInertiaPageProps {
    auth: TInertiaPagePropsAuth,
    localization: {
        locale: string,
        locales: Record<string, string>,
        translations: Record<string, string>,
    },
    session_lifetime: number,
    app_version: string,
    php_version: string,

    errors: InertiaPage["props"]['errors'] // Errors & ErrorBag;
}

export interface TInertiaPage<TPageData = never> extends Omit<InertiaPage, 'props'> {
    props: TInertiaPageProps & {
        pageData: TPageData
    }
}

export function usePage<TPageData = never>(): TInertiaPage<TPageData> {
    const fn = window.usePage as <T>() => TInertiaPage<T>;
    return fn?.<TPageData>()
}
