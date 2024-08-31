<template>
    <div ref="elem" class="resizable-component" :style="style">
        <slot/>
        <div
            v-for="el in active"
            v-show="!maximize"
            :key="el"
            :class="'resizable-handle resizable-' + el"
        />
    </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";

const ELEMENT_MASK: Record<string, { bit: number, cursor: string }> = {
    "resizable-r": {bit: 0b0001, cursor: "e-resize"},
    "resizable-rb": {bit: 0b0011, cursor: "se-resize"},
    "resizable-b": {bit: 0b0010, cursor: "s-resize"},
    "resizable-lb": {bit: 0b0110, cursor: "sw-resize"},
    "resizable-l": {bit: 0b0100, cursor: "w-resize"},
    "resizable-lt": {bit: 0b1100, cursor: "nw-resize"},
    "resizable-t": {bit: 0b1000, cursor: "n-resize"},
    "resizable-rt": {bit: 0b1001, cursor: "ne-resize"},
    "drag-el": {bit: 0b1111, cursor: "pointer"},
} as const;

const CALC_MASK = {
    l: 0b0001,
    t: 0b0010,
    w: 0b0100,
    h: 0b1000,
};

const _props = defineProps<{
    width?: number,
    minWidth?: number, // 0
    maxWidth?: number,
    height?: number,
    minHeight?: number, // 0
    maxHeight?: number,
    before?: {top: number, height: number}, // 0
    after?: {top: number, height: number},
    minDistance?: number,
    left?: number, // 0
    top?: number, // 0
    active?: ("r" | "rb" | "b" | "lb" | "l" | "lt" | "t" | "rt")[], // ["r", "rb", "b", "lb", "l", "lt", "t", "rt"]
    fitParent?: boolean, //false
    dragSelector?: string,
    maximize?: boolean, //false
    disableAttributes?: ('l' | 't' | 'w' | 'h')[] // ["l", "t", "w", "h"]
}>();

const emit = defineEmits([
    "mount", "destroy", "resize:start", "resize:move", "resize:end", "drag:start", "drag:move", "drag:end", "maximize", "sizerelated"
])

const cfg = reactive({
    minW: _props.minWidth ?? 35,
    minH: _props.minHeight ?? 35,
    maxW: _props.maxWidth,
    maxH: _props.maxHeight,
    minDistance: _props.minDistance ?? 5,
    before: _props.before,
    after: _props.after,
    fitParent: _props.fitParent ?? true,
    dragSelector: _props.dragSelector,
    disableAttributes: _props.disableAttributes,
    maximize: _props.maximize,
});

const state = reactive({
    w: _props.width,
    h: _props.height,
    l: _props.left,
    t: _props.top,
});

const xy = reactive({
    mouseX: 0,
    mouseY: 0,
    offsetX: 0,
    offsetY: 0,
    parentW: 0,
    parentH: 0
})

const resizeState = ref(0);
const elem = ref<HTMLElement>();
const dragElements = ref([] as Node[]);
const dragState = ref(false);
const prevState = ref<any>(false);
const calcMap = ref(0b1111);

const style = computed(() => {
    return {
        ...(calcMap.value & CALC_MASK.w && {
            width: typeof state.w === "number" ? state.w + "px" : state.w,
        }),
        ...(calcMap.value & CALC_MASK.h && {
            height: typeof state.h === "number" ? state.h + "px" : state.h,
        }),
        ...(calcMap.value & CALC_MASK.l && {
            left: typeof state.l === "number" ? state.l + "px" : state.l,
        }),
        ...(calcMap.value & CALC_MASK.t && {
            top: typeof state.t === "number" ? state.t + "px" : state.t,
        }),
    };
})

watch(() => _props.dragSelector, (selector) => {
    setupDragElements(selector!);
})
watch(() => _props.height, (val) => {
    state.h = val
})
watch(() => _props.top, (val) => {
    state.t = val
})

onMounted(() => {
    const el = elem.value!;
    const elParent = el.parentElement!;
    if (!state.w) {
        state.w = elParent.clientWidth;
    } else if (state.w && state.w.toString() !== "auto") {
        typeof state.w !== "number" && (state.w = el.clientWidth);
    }
    if (state.h === undefined || state.h === null) {
        state.h = elParent.clientHeight;
    } else if (state.h && state.h.toString() !== "auto") {
        typeof state.h !== "number" && (state.h = el.clientHeight);
    }else{
        state.h = 0;
    }
    typeof state.l !== "number" && (state.l = el.offsetLeft - elParent.offsetLeft);
    typeof state.t !== "number" && (state.t = el.offsetTop - elParent.offsetTop);
    cfg.minW && state.w < cfg.minW && (state.w = cfg.minW);
    cfg.minH && state.h < cfg.minH && (state.h = cfg.minH);
    cfg.maxW && state.w > cfg.maxW && (state.w = cfg.maxW);
    cfg.maxH && state.h > cfg.maxH && (state.h = cfg.maxH);

    setMaximize(cfg.maximize);
    if(cfg.dragSelector)
        setupDragElements(cfg.dragSelector);

    cfg.disableAttributes?.forEach((attr) => {
        switch (attr) {
            case "l":
                calcMap.value &= ~CALC_MASK.l;
                break;
            case "t":
                calcMap.value &= ~CALC_MASK.t;
                break;
            case "w":
                calcMap.value &= ~CALC_MASK.w;
                break;
            case "h":
                calcMap.value &= ~CALC_MASK.h;
        }
    });

    document.documentElement.addEventListener("mousemove", handleMove, true);
    document.documentElement.addEventListener("mousedown", handleDown, true);
    document.documentElement.addEventListener("mouseup", handleUp, true);

    document.documentElement.addEventListener("touchmove", handleMove, true);
    document.documentElement.addEventListener("touchstart", handleDown, true);
    document.documentElement.addEventListener("touchend", handleUp, true);
    emitEvent("mount");
})
onBeforeUnmount(() => {
    document.documentElement.removeEventListener("mousemove", handleMove, true);
    document.documentElement.removeEventListener("mousedown", handleDown, true);
    document.documentElement.removeEventListener("mouseup", handleUp, true);

    document.documentElement.removeEventListener("touchmove", handleMove, true);
    document.documentElement.removeEventListener("touchstart", handleDown, true);
    document.documentElement.removeEventListener("touchend", handleUp, true);
    emitEvent("destroy");
})

function setMaximize(value: boolean) {
    const parentEl = elem.value!.parentElement!;
    if (value) {
        prevState.value = {w: state.w, h: state.h, l: state.l, t: state.t};
        state.t = state.l = 0;
        state.w = parentEl.clientWidth;
        state.h = parentEl.clientHeight;
    } else {
        restoreSize();
    }
}

function restoreSize() {
    if (prevState.value) {
        state.l = prevState.value.l;
        state.t = prevState.value.t;
        state.h = prevState.value.h;
        state.w = prevState.value.w;
    }
}

function setupDragElements(selector: string) {
    const oldList = elem.value!.querySelectorAll(".drag-el");
    oldList.forEach((el) => {
        el.classList.remove("drag-el");
    });

    const nodeList = elem.value!.querySelectorAll(selector);
    nodeList.forEach((el) => {
        el.classList.add("drag-el");
    });
    dragElements.value = Array.prototype.slice.call(nodeList);
}

function emitEvent(eventName: any, additionalOptions?: any) {
    emit(eventName, {
        eventName,
        left: state.l,
        top: state.t,
        width: state.w,
        height: state.h,
        // cmp: this as any,
        ...additionalOptions,
    });
    if(eventName !== 'destroy' && eventName != 'sizerelated')
        emitEvent('sizerelated', { action: eventName} );
}

function handleMove(event: TouchEvent|MouseEvent) {
    if (resizeState.value === 0) {
        return;
    }

    if (!dragState.value) {
        if (state.w == undefined || isNaN(state.w)) {
            state.w = elem.value!.clientWidth;
        }
        if (state.h == undefined || isNaN(state.h)) {
            state.h = elem.value!.clientHeight;
        }
    }

    if (!state.w || !state.h) {
        console.log('something went wrong', state);
        return;
    }

    let eventY: number, eventX: number;
    if ('touches' in event && event.touches && event.touches.length >= 0) {
        eventY = event.touches[0].clientY;
        eventX = event.touches[0].clientX;
    } else if ('clientX' in event) {
        eventY = event.clientY;
        eventX = event.clientX;
    }else{
        console.log('neither touches nor clientX in event', event);
        return;
    }
    if (cfg.maximize && prevState.value) {
        restoreSize();
        prevState.value = undefined;
        state.t = eventY > xy.parentH / 2 ? xy.parentH - state.h : 0;
        state.l = eventX > xy.parentW / 2 ? xy.parentW - state.w : 0;
        emitEvent("maximize", {state: false});
    }
    let diffX = eventX - xy.mouseX + xy.offsetX,
        diffY = eventY - xy.mouseY + xy.offsetY;

    const rect = elem.value!.getBoundingClientRect();
    if (rect) {
        const scaleX = rect.width / elem.value!.offsetWidth || 1;
        const scaleY = rect.height / elem.value!.offsetHeight || 1;
        diffX /= scaleX;
        diffY /= scaleY;
    }else{
        console.log('rect null')
    }

    xy.offsetX = xy.offsetY = 0;
    if (resizeState.value & ELEMENT_MASK["resizable-r"].bit) {
        if (!dragState.value && state.w + diffX < cfg.minW)
            xy.offsetX = diffX - (diffX = cfg.minW - state.w);
        else if (
            !dragState.value &&
            (cfg.maxW && state.w + diffX > cfg.maxW) &&
            (!cfg.fitParent || state.w + state.l! < xy.parentW - 7) &&
            (!cfg.after || state.w + state.l! + diffX < cfg.after.top - 2)
        )
            xy.offsetX = diffX - (diffX = cfg.maxW - state.w);
        else if (
            cfg.fitParent &&
            state.l! + state.w + diffX > xy.parentW - 7
        )
            xy.offsetX =
                diffX - (diffX = xy.parentW - 7 - state.l! - state.w);
        else if (cfg.after && state.w + state.l! + diffX >= cfg.after.top - 2) {
            xy.offsetX =
                diffX - (diffX = cfg.after.top - 2 - state.l! - state.w);
        }

        calcMap.value & CALC_MASK.w && (state.w += dragState.value ? 0 : diffX);
    }
    if (resizeState.value & ELEMENT_MASK["resizable-b"].bit) {
        if (!dragState.value && state.h + diffY < cfg.minH)
            xy.offsetY = diffY - (diffY = cfg.minH - state.h);
        else if (
            !dragState.value &&
            cfg.maxH &&
            state.h + diffY > cfg.maxH &&
            (!cfg.fitParent || state.h + state.t! < xy.parentH)
            &&
            (!cfg.after || state.h + state.t! + diffY < cfg.after.top)
        )
            xy.offsetY = diffY - (diffY = cfg.maxH - state.h);
        else if (
            cfg.fitParent &&
            state.t! + state.h + diffY > xy.parentH
        )
            xy.offsetY =
                diffY - (diffY = xy.parentH - state.t! - state.h);
        else if (!dragState.value && cfg.after && state.h + state.t! + diffY >= cfg.after.top) {
            xy.offsetX =
                diffY - (diffY = cfg.after.top - state.t! - state.h);
        }

        calcMap.value & CALC_MASK.h && (state.h += dragState.value ? 0 : diffY);
    }
    if (resizeState.value & ELEMENT_MASK["resizable-l"].bit) {
        const beforeRight = cfg.before ? cfg.before.top + cfg.before.height + 2 : null;
        if (!dragState.value && state.w - diffX < cfg.minW)
            xy.offsetX = diffX - (diffX = state.w - cfg.minW);
        else if (
            !dragState.value &&
            cfg.maxW &&
            state.w - diffX > cfg.maxW &&
            state.l! >= 0 &&
            (!beforeRight || state.l! + diffX > beforeRight)
        )
            xy.offsetX = diffX - (diffX = state.w - cfg.maxW);
        else if (cfg.fitParent && state.l! + diffX < 0)
            xy.offsetX = diffX - (diffX = -state.l!);
        else if (beforeRight && state.l! + diffX <= beforeRight) {
            xy.offsetX =
                diffX - (diffX = beforeRight - state.l!);
        }

        calcMap.value & CALC_MASK.l && (state.l! += diffX);
        calcMap.value & CALC_MASK.w && (state.w -= dragState.value ? 0 : diffX);
    }
    if (resizeState.value & ELEMENT_MASK["resizable-t"].bit) {
        const beforeBottom = cfg.before ? cfg.before.top + cfg.before.height : null;
        if (!dragState.value && state.h - diffY < cfg.minH)
            xy.offsetY = diffY - (diffY = state.h - cfg.minH);
        else if (
            !dragState.value &&
            cfg.maxH &&
            state.h - diffY > cfg.maxH &&
            state.t! >= 0
            &&
            (!beforeBottom || state.t! + diffY > beforeBottom)
        )
            xy.offsetY = diffY - (diffY = state.h - cfg.maxH);
        else if (cfg.fitParent && state.t! + diffY < 0)
            xy.offsetY = diffY - (diffY = -state.t!);
        else if (!dragState.value && beforeBottom && state.t! + diffY <= beforeBottom) {
            xy.offsetX =
                diffY - (diffY = beforeBottom - state.t!);
        }

        calcMap.value & CALC_MASK.t && (state.t! += diffY);
        calcMap.value & CALC_MASK.h && (state.h -= dragState.value ? 0 : diffY);
    }
    xy.mouseX = eventX;
    xy.mouseY = eventY;
    emitEvent(!dragState.value ? "resize:move" : "drag:move");
}

function handleDown(event: MouseEvent|TouchEvent) {
    const el = event.target as HTMLElement;
    if (
        el.closest &&
        el.closest(".resizable-component") !== elem.value
    )
        return;

    for (let elClass in ELEMENT_MASK) {
        if (
            elem.value!.contains(el) &&
            ((el.closest && el.closest(`.${elClass}`)) ||
                el.classList.contains(elClass))
        ) {
            elClass === "drag-el" && (dragState.value = true);
            document.body.style.cursor = (ELEMENT_MASK[elClass] as any).cursor;
            if ('touches' in event && event.touches && event.touches.length >= 1) {

                xy.mouseX = event.touches[0].clientX;
                xy.mouseY = event.touches[0].clientY;
            } else if('clientX' in event) {
                event.preventDefault && event.preventDefault();
                xy.mouseX = event.clientX;
                xy.mouseY = event.clientY;
            }
            xy.offsetX = xy.offsetY = 0;
            resizeState.value = ELEMENT_MASK[elClass].bit;
            xy.parentH = elem.value!.parentElement!.clientHeight;
            xy.parentW = elem.value!.parentElement!.clientWidth;
            emitEvent(!dragState.value ? "resize:start" : "drag:start");
            break;
        }
    }
}

// return rightLines.value.findLast(t => {
//     const tBottom = t.top + t.height;
//     return top==t.top || bottom == tBottom ||
//         (top > t.top && top < tBottom)
//         || (bottom > t.top && bottom < tBottom)
// });
function checkMinDistance(){ //keepHeight = true){
    const {before, after} = cfg;
    if(before){
        const tDiff = state.t! - before.top - before.height;
        if(tDiff !== 0 && Math.abs(tDiff) < cfg.minDistance){
            state.t! -= tDiff;
            // if(!keepHeight){
            //     state.h += tDiff
            // }
        }
    }

    if(after){
        const bDiff = state.t! + state.h! - after.top;
        if(bDiff !== 0 && Math.abs(bDiff) < cfg.minDistance){
            state.t! += bDiff;
            // if(!keepHeight){
            //     state.h += bDiff
            // }
        }
    }
}
function handleUp() {
    if (resizeState.value !== 0) {
        resizeState.value = 0;
        document.body.style.cursor = "";

        if(dragState.value){
            checkMinDistance();
        }

        emitEvent(!dragState.value ? "resize:end" : "drag:end");
        dragState.value = false;
    }
}

// const c = {
//     watch: {
//         maxWidth(value) {
//             cfg.maxW = value;
//         },
//         maxHeight(value) {
//             maxH = value;
//         },
//         minWidth(value) {
//             cfg.minW = value;
//         },
//         minHeight(value) {
//             minH = value;
//         },
//         width(value) {
//             typeof value === "number" && (state.w = value);
//         },
//         height(value) {
//             typeof value === "number" && (state.h = value);
//         },
//         left(value) {
//             typeof value === "number" && (state.l = value);
//         },
//         top(value) {
//             typeof value === "number" && (state.t = value);
//         },
//         dragSelector(selector) {
//             setupDragElements(selector);
//         },
//         maximize(value) {
//             setMaximize(value);
//             emitEvent("maximize", {state: value});
//         },
//     },
// };
</script>

<style>
.resizable-component {
    position: relative;
}
.resizable-component > .resizable-handle{
    display: block;
    position: absolute;
    touch-action: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    --handle_size: 7px;
}

.resizable-component > .resizable-r {
    z-index: 90;
    cursor: e-resize;
    width: var(--handle_size);
    right: 0;
    top: 0;
    height: 100%;
}

.resizable-component > .resizable-rb {
    cursor: se-resize;
    width: var(--handle_size);
    height: var(--handle_size);
    right: 0;
    bottom: 0;
    z-index: 91;
}

.resizable-component > .resizable-b {
    z-index: 90;
    cursor: s-resize;
    height: var(--handle_size);
    bottom: 0;
    width: 100%;
    left: 0;
}

.resizable-component > .resizable-lb {
    cursor: sw-resize;
    width: var(--handle_size);
    height: var(--handle_size);
    left: 0;
    bottom: 0;
    z-index: 91;
}

.resizable-component > .resizable-l {
    z-index: 90;
    cursor: w-resize;
    width: var(--handle_size);
    left: 0;
    height: 100%;
    top: 0;
}

.resizable-component > .resizable-lt {
    cursor: nw-resize;
    width: var(--handle_size);
    height: var(--handle_size);
    left: 0;
    top: 0;
    z-index: 91;
}

.resizable-component > .resizable-t {
    z-index: 90;
    cursor: n-resize;
    height: var(--handle_size);
    top: 0;
    width: 100%;
    left: 0;
}

.resizable-component > .resizable-rt {
    cursor: ne-resize;
    width: var(--handle_size);
    height: var(--handle_size);
    right: 0;
    top: 0;
    z-index: 91;
}
</style>
