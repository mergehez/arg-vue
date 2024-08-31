<script setup lang="ts">
import {onMounted} from "vue";
import {twMerge} from "tailwind-merge";

export type TFyingThing = {
    x: number, y: number,
    changeX: number, changeY: number,
    img: CanvasImageSource
}

const props = withDefaults(defineProps<{
    svgs: string[],
    size?: number,
    speed?: number,
    autostart?: boolean,
}>(), {
    size: 20,
    speed: 0.1,
    autostart: true,
})

let canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D;
const things: TFyingThing[] = [];
const randomColor = () => Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
const rnd = (max: number) => Math.floor(Math.random() * max);

function updatePosition(note: TFyingThing){
    note.x += note.changeX * props.speed;
    note.y += note.changeY * props.speed;

    const p = 1;
    if(note.y <= p || note.y + props.size + p >= canvas.height){
        note.changeY = -note.changeY;
        note.y += (note.y <= p ? p : -p);
    }
    if(note.x <= p || note.x + props.size + p >= canvas.width){
        note.changeX = -note.changeX
        note.x += (note.x <= p ? p : -p);
    }
}
let move = true;
function animate() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < things.length; i++) {
        ctx.drawImage(things[i].img, things[i].x, things[i].y, props.size, props.size);
        updatePosition(things[i]);
    }
    if(move)
        requestAnimationFrame(animate)
}

onMounted(()=>{
    // setTimeout(() => { // on mobile devices, canvas size is not correct on first render
        canvas ??= document.querySelector('canvas') as HTMLCanvasElement;
        if(!canvas)
            return;
        ctx ??= canvas.getContext('2d')!;
        const nav = document.getElementById('#nav');
        const navHeight = nav ? nav.clientHeight : 0;
        const canvasHeight = Math.round((window.innerHeight - navHeight)*0.95);
        const b = document.querySelector('main.h-nvh')!;
        canvas.style.width = (b.clientWidth*0.95)+'px';
        // canvas.style.height = (b.clientHeight*0.95)+'px';
        canvas.style.height = canvasHeight+'px';
        canvas.width = (b.clientWidth*0.95);
        // canvas.height = (b.clientHeight*0.95);
        canvas.height = canvasHeight;
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        things.slice(0, things.length-1)
        let lastSvgIndex = 0;
        for (let i = 0; i < 100; i++) {
            const img = new Image();
            img.src = props.svgs[(lastSvgIndex++ % props.svgs.length)] +
                `?size=${props.size}&color=%23${randomColor()}`;//&rotate=${[0, 1, 2, 3][rnd(3)]}`;
            things.push({
                x: Math.floor(rnd(10) * canvas.width/10),
                y: Math.floor(rnd(10) * canvas.height/10),
                changeX: (20+rnd(10))/20 * [1,-1][rnd(10) > 4 ? 0 : 1],
                changeY: (20+rnd(10))/20 * [1,-1][rnd(10) > 4 ? 0 : 1],
                img
            });
        }

        if(props.autostart)
            start();
    // }, 100);
})
function start(){
    if(!canvas)
        return;
    move = true;
    animate();
}
function stop(){
    move = false;
}

defineExpose({start, stop});
</script>

<template>
    <canvas :class="twMerge('fixed w-screen h-screen opacity-20 dark:opacity-30 z-0 select-none pointer-events-none', $attrs.class as any)"></canvas>
</template>
