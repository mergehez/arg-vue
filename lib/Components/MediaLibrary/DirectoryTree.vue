<script setup lang="ts">
import {Directory} from "./media-library-types";
import {openConfirmationDialog} from "../Overlays";
import {vAutoAnimate} from "@formkit/auto-animate/vue";
import MenuPopper from "../Overlays/MenuPopper.vue";

const props = defineProps<{
    directories: Directory[],
    active: Directory
}>()
const emit = defineEmits([
    'selected',
    'createSubfolder',
    'renameFolder',
    'deleteFolder'
])

function askToDeleteFolder(dir: Directory) {
    if (dir.id !== props.active.id) {
        return;
    }
    openConfirmationDialog({
        message: 'Are you sure to delete this folder permanently?' + (dir.fileCount ? `<br/><b class="text-red-500 text-lg">It contains ${dir.fileCount} files!</b>` : ''),
        textConfirm: 'Yes, delete it!',
        textCancel: 'Cancel',
        classConfirm: 'btn-danger',
        onConfirm: () => {
            emit('deleteFolder', dir)
        }
    })
}

function selectFolder(dir: Directory) {
    dir.open = true;
    emit('selected', dir)
}

function createSubfolder(dir: Directory) {
    if (dir.id !== props.active.id) {
        return;
    }
    emit('createSubfolder', dir)
}

</script>
<template>
    <div class="flex flex-col image-manager-dir-tree pl-2" v-auto-animate>
        <template v-for="dir in directories" :key="dir.directory">
            <div
                v-if="!dir.parent_id || directories.find(d => d.id === dir.parent_id)?.open"
                class="mb-1 flex items-center"
                :style="{
                paddingLeft: (dir.indent - 1) * 20 + 'px'
            }">
                <button
                    v-if="dir.indent"
                    class="icon text-reverse"
                    :class="dir.inner.length ? (!dir.open ? 'icon-[mdi--plus-bold]' : 'icon-[mdi--minus]') : 'invisible'"
                    @click="dir.open = !dir.open">

                </button>
                <div
                    class="dir-btn flex-1 w-full font-bold text-sm px-3 py-1 cursor-pointer pr-1 relative items-center justify-start flex gap-2 group"
                    :class="dir.id === active.id ? 'bg-green-500 dark:bg-green-800 text-white' : 'bg-x2 hover:bg-x3'"
                    @click="selectFolder(dir)"
                >
                    <div class="flex-1 text-left truncate">{{ dir.path.basename }}</div>
                    <MenuPopper class="p-0 !border-0 !m-0" customTrigger>
                        <template #trigger="{toggle}">
                            <span
                                @click.prevent.stop="toggle"
                                class="icon icon-[fluent--chevron-down-12-filled] text-xl text-x1"
                                :class="dir.id === active.id ? 'visible' : 'invisible'"
                            ></span>
                        </template>
                        <template #content>
                            <div class="flex flex-col items-stretch divide-y divide-x3">
                                <button class="btn btn-light-borderless px-2.5 rounded-none py-1 text-sm"
                                        @click.prevent.stop="$emit('renameFolder', dir)"
                                        aria-label="rename folder">Rename
                                </button>
                                <button class="btn btn-light-borderless px-2.5 rounded-none py-1 text-sm"
                                        @click.prevent.stop="askToDeleteFolder(dir)"
                                        aria-label="delete folder">Delete
                                </button>
                                <button class="btn btn-light-borderless px-2.5 rounded-none py-1 text-sm"
                                        @click.prevent.stop="createSubfolder(dir)"
                                        aria-label="add subfolder">Add Subfolder
                                </button>
                            </div>
                        </template>
                    </MenuPopper>
                    <span class="text-xs" :class="dir.id != active.id ? 'opacity-60' : ''">{{ dir.fileCount || '' }}</span>
                </div>
            </div>
        </template>
    </div>
</template>
