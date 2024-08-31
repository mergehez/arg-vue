
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
