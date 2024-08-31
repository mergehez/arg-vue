import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
// import globalState from "@/Helpers/globalState";
import {InertiaForm} from "@inertiajs/vue3";
import type {Router} from "@inertiajs/core";
import {VisitOptions} from "@inertiajs/core";
import {TApiResponse, TAxiosError} from "./models";
import {changeLanguage, usePage} from "./inertia_helpers";

type axConfig = AxiosRequestConfig;
export type TApiError = TAxiosError; // AxiosError;
export const api = {
    request: async <T = any>(config: axConfig): Promise<AxiosResponse<T>> => {
        return await axios.request<T>(config);
    },
    request2: <T = any>(config: axConfig) => api.request<TApiResponse<T>>(config),
    get: <T = any>(url: string, config?: axConfig) => api.request<T>({method: 'get', url, ...config}),
    get2: <T = any>(url: string, config?: axConfig) => api.request2<T>({method: 'get', url, ...config}),
    post: <T = any>(url: string, data?: any, config?: axConfig) => api.request<T>({method: 'post', url, data, ...config}),
    post2: <T = any>(url: string, data?: any, config?: axConfig) => api.request2<T>({method: 'post', url, data, ...config}),
    put: <T = any>(url: string, data?: any, config?: axConfig) => api.request<T>({method: 'put', url, data, ...config}),
    put2: <T = any>(url: string, data?: any, config?: axConfig) => api.request2<T>({method: 'put', url, data, ...config}),
    delete: <T = any>(url: string, config?: axConfig) => api.request<T>({method: 'delete', url, ...config}),
    delete2: <T = any>(url: string, config?: axConfig) => api.request2<T>({method: 'delete', url, ...config}),
    logout: async (then?: any) => {
        await api.post2(route('auth.logout'));
        // globalState.activity.stopListeners();
        usePage().props.auth.user = undefined;
        if (then) then();
    },
    changeLanguage: (langKey: string) => {
        api.get(route('language', {language: langKey})).then();
        changeLanguage(langKey);
    },
    // logout:  () => router.post(route('logout'), null, {onFinish: globalState.removeAuthListener}),
}

export const apiInertia = {
    request: <T extends object>(method: 'get' | 'post' | 'put' | 'patch' | 'delete', form: InertiaForm<T> | Router, url: string, options?: Partial<VisitOptions>) => {
        options ??= {};
        const onFinish = options?.onFinish;
        options.onFinish = (v) => {
            onFinish?.(v);
            // globalState.activity.interactedWithBackend();
        }
        return form[method](url, options as any);
    },
    get: <T extends object>(router: Router, url: string, options?: Partial<VisitOptions>) => {
        return apiInertia.request<T>('get', router, url, options);
    },
    post: <T extends object>(form: InertiaForm<T> | Router, url: string, options?: Partial<VisitOptions>) => {
        return apiInertia.request<T>('post', form, url, options);
    },
    put: <T extends object>(form: InertiaForm<T> | Router, url: string, options?: Partial<VisitOptions>) => {
        return apiInertia.request<T>('put', form, url, options);
    },
    delete: <T extends object>(form: InertiaForm<T> | Router, url: string, options?: Partial<VisitOptions>) => {
        return apiInertia.request<T>('delete', form, url, options);
    }
}

export function handleFormValidationErrors<T extends object>(form: InertiaForm<T>, err: TApiError) {
    const errors = err.response?.data.errors;
    form.errors = {};
    if (errors) {
        // setTimeout(() => {
            for (const key in errors) {
                if (!Array.isArray(errors[key]))
                    (form.errors as any)[key] = errors[key];
                else if (errors[key].length === 0)
                    (form.errors as any)[key] = window.__('something_went_wrong');
                else if (errors[key].length === 1)
                    (form.errors as any)[key] = errors[key][0];
                else
                    (form.errors as any)[key] = '- ' + errors[key].join('<br/>- ');
                // form.errors[key] = Array.isArray(errors[key]) ? '- ' +errors[key].join('<br/>- ') : errors[key];
            }
        // }, 200);
    } else {
        console.error(err);
    }

}
