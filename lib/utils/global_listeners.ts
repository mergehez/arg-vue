import {uniqueId} from "./helpers";

type Tlistener = (e:KeyboardEvent) => void;

const listeners: Record<string, Tlistener> = {};
function onKeyDown(e: KeyboardEvent){
    for (const l of Object.keys(listeners)) {
        listeners[l](e);
    }
}
export const globalKeyDownListener = {
    add: (listener: Tlistener, key?: string) => {
        key ??= uniqueId();
        const wasEmpty = Object.keys(listeners).length == 0;
        listeners[key] = listener;
        if(wasEmpty)
            globalKeyDownListener.onLayoutMounted();
        return key;
    },
    remove: (key: string) => {
        delete listeners[key];
        if(Object.keys(listeners).length == 0)
            globalKeyDownListener.onLayoutUnmounted();
    },
    onLayoutMounted: () => {
        document.addEventListener('keydown', onKeyDown);
    },
    onLayoutUnmounted(){
        document.removeEventListener('keydown', onKeyDown);
    }
}
