import {reactive} from "vue";
import {Placement} from "@popperjs/core";

export const overlayState = reactive({
    modalZIndex: 50,
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
    visible?: boolean|null,
    disableClickAway?: boolean,
    disabled?: boolean,
    arrow?: boolean,
    closeOnClickInside?: boolean,
    locked?: boolean,
    triggerWrapperClass?: string,
    customTrigger?: boolean,
}