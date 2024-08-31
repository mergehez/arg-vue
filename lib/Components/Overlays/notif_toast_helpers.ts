import {reactive} from "vue";
import {overlayState} from "./overlay_utils";

export type TAlert = 'info' | 'danger' |'success' | 'warning' | 'primary' | 'dark' | 'light';

const defaultState = {
    show: false,
    message: '',
    onClick: undefined as undefined|(() => void),
    type: 'primary' as TAlert,
    clickable: false,
    timeoutId: 0,
    timeoutDur: 0,
    contentHeight: 24,
};

const state = reactive(defaultState)
export const notifToastState =  state;
export const durSlide = 500;
export const durTilt = 200;
export function showNotification(message: string, type: TAlert, onClick?: () => void, duration: number = 3000) {
    showNotificationOpts({message, type, onClick, duration});
}
export function showNotificationOpts(opts: {message: string, type: TAlert, onClick?: () => void, duration?: number}){
    state.clickable = !!opts.onClick;
    state.timeoutDur = (opts.duration ?? 3000) + durSlide + durTilt;
    state.onClick = () => {
        if(state.clickable){
            opts.onClick?.();
        }
        clearTimeout(state.timeoutId);
        state.timeoutDur = 0; // prevent onMouseOut to set timeout
        state.show = false
    };
    state.type = opts.type ?? 'primary';
    state.message = opts.message;
    setTimeout(() => {
        overlayState.modalZIndex++;
        state.show = true;
        state.timeoutId = window.setTimeout(() => {
            state.contentHeight = document.getElementById('nav-notif')?.clientHeight ?? 24;
            return state.show = false;
        }, state.timeoutDur);
    }, 100)
}
export function showNotificationFromAxiosError(err: any){
    showNotification(err.response?.data?.message ?? err.message ?? window.__('something_went_wrong'), 'danger');
}

export function onMouseOver(){
    clearTimeout(state.timeoutId);
}

export function onMouseOut(){
    if(state.timeoutDur > 0) // this is set to 0 on click
        state.timeoutId = window.setTimeout(() => state.show = false, state.timeoutDur);
}