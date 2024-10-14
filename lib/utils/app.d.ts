import {TArgVueTrKeys} from "./required_tr_keys";
import type {Page, PageProps, Router} from "@inertiajs/core";
import { route as routeFn } from 'ziggy-js';

export {};

declare global {
    var route: typeof routeFn;
    interface Window {
        webkitAudioContext: {
            prototype: AudioContext;
            new(contextOptions?: AudioContextOptions): AudioContext;
        };
        // globalSearch: any;
        // globalSearchState: any;
        // route: typeof ziggy;
        themeManager: {
            update: (newTheme: 'dark' | 'light') => 'dark' | 'light';
            toggle: () => 'dark' | 'light';
            isDark: boolean;
            listener: Function | undefined;
            _init: () => void;
        };
        __: (key: TArgVueTrKeys, replace?: Record<string, string>) => string;
        usePage: <SharedProps extends PageProps>() => Page<SharedProps>;
        useForm: <TForm extends FormDataType>(data: TForm | (() => TForm)) => InertiaForm<TForm>;
        router: Router;
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        route: typeof routeFn;
    }
}