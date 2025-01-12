import {reactive} from "vue";
import {Placement} from "@popperjs/core";

export const overlayState = reactive({
    modalZIndex: 50,
})
export const modalZIndexState = reactive({
    _ids: {} as Record<string, number>,
    _min: 50,
    get(id: string) {
        return this._ids[id] ?? this.increment(id);
    },
    increment(id: string) {
        const newMax = Math.max(this._min, Object.values(this._ids).reduce((a, b) => Math.max(a, b), 0) + 1)
        this._ids[id] = newMax;
        return newMax;
    },
    decrement(id: string) {
        const newMin = Math.max(this._min, Math.min(this._min, Object.values(this._ids).reduce((a, b) => Math.min(a, b), 1000) - 1))
        this._ids[id] = newMin;
        return newMin;
    },
    remove(id: string) {
        delete this._ids[id];
    }
})

export type PopperProps = {
    placement?: Placement,
    offsetSkid?: number,
    offsetDistance?: number,
    arrowPadding?: number,
    content?: string,
    contentClass?: string,
    wrapperClass?: string,
    hover?: boolean,
    visible?: boolean | null,
    disableClickAway?: boolean,
    disabled?: boolean,
    arrow?: boolean,
    closeOnClickInside?: boolean,
    locked?: boolean,
    triggerWrapperClass?: string,
    customTrigger?: boolean,
}