import {InertiaForm} from "@inertiajs/vue3";

export type PaginatedData<T> = {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url?: string | null;
        label: string;
        active: boolean;
    }[]
    next_page_url: string;
    path: string;
    per_page: number;
    prev_page_url?: null;
    to: number;
    total: number;
}


export type TApiResponse<T> = {
    message: string,
    result: T
}
export type TApiValidationResponse<T> = {
    message: string,
    errors: Record<string, any>
}

export type TAxiosError = {
    message: string,
    status: number,
    response: {
        status: number,
        data: {
            errors?: Record<string, any>
            result: string,
            message: string,
            data?: any,
        },
    }
}

export interface TSearchResult {
    [key: string]: any
}

export type TModelForm<TModel> = Omit<TModel, 'updated_at'|'created_at'> & {updated_at?: string, created_at?: string};
export type TModelFormHelpers<TModel> = {
    form: InertiaForm<TModelForm<TModel>>,
    submit: () => Promise<TModel|undefined>
}