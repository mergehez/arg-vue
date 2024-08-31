import ziggy from '../../../vendor/tightenco/ziggy/src/js/index';
import {TArgVueTrKeys} from "./required_tr_keys";
import {usePage} from "@inertiajs/vue3";

export {};

// import route from 'ziggy-js';

declare global {
    const route: typeof ziggy;
    interface Window {
        webkitAudioContext: {
            prototype: AudioContext;
            new(contextOptions?: AudioContextOptions): AudioContext;
        };
    }
}
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        route: typeof ziggy;
    }
}
declare global {
    interface Window {
        // globalSearch: any;
        // globalSearchState: any;
        themeManager: any;
        __: (key: TArgVueTrKeys, replace?: Record<string, string>) => string;
        usePage: typeof usePage;
    }
}
