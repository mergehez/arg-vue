import type {InertiaForm} from "@inertiajs/vue3";

export type PaginatedData<T> = {
    data: T[];
    per_page: number;
    total: number;
    from: number;
    to: number;
    current_page: number;
    last_page: number;
    first_page_url?: string;
    prev_page_url?: null;
    next_page_url?: string;
    last_page_url: string;
    links: {
        url?: string | null;
        label: string;
        active: boolean;
    }[]
    path: string;
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