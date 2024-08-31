<script setup lang="ts">
import {ref} from "vue";
import {twMerge} from "tailwind-merge";

defineProps<{
    youtubeId: string,
    frameClass?: string
}>()

const videoLoaded = ref(false);
function fixYoutubeData(data: string){
    return data.split('?')[0].split('&')[0];
}

const origin = window.location.origin;
</script>

<template>
    <div class="inline-flex aspect-video overflow-hidden m-0 p-0 relative flex-grow max-w-sm"
         style="width: min(100%, 600px); min-width: min(60%, 300px); max-width: min(100%, 1500px); max-height: 60dvh" >
        <iframe v-show="videoLoaded"
                @load="videoLoaded = true;"
                :class="twMerge('flex-grow m-0 p-0 border-none', frameClass)"
                :src="`https://www.youtube.com/embed/${fixYoutubeData(youtubeId as string)}?hl=ku&origin=${origin}&playsinline=1&rel=0`" allowfullscreen></iframe>

        <div v-if="!videoLoaded" role="status"
             class="absolute inset-0 flex items-center justify-center bg-gray-300 rounded-lg animate-pulse dark:bg-gray-700">
            <svg class="w-2/12" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><rect x="0" y="0" width="24" height="24" fill="none" stroke="none" /><path fill="currentColor" d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5l-6-3.5v7z"/></svg>
            <span class="sr-only">Loading...</span>
        </div>
    </div>
</template>
