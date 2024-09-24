import {TArgVueTrKeys} from "./required_tr_keys";
import {usePage} from "@inertiajs/vue3";
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
        usePage: typeof usePage;
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        route: typeof routeFn;
    }
}