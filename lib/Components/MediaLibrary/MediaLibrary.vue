<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import * as IM from './media-library-types';
// import {defaultMediaLibraryConfig} from './media-library-types';
import DirectoryTree from './DirectoryTree.vue';
import CenteredModal from "../Overlays/CenteredModal.vue";
import {openConfirmationDialog, showNotificationOpts, TAlert} from "../Overlays";
import dayjs from "dayjs";
import {copyToClipboard, hasClipboard, sizeToString} from "../../utils";
import DirectoryPath from "./DirectoryPath.vue";
import {vAutoAnimate} from "@formkit/auto-animate/vue";
import {useUrlSearchParams} from "@vueuse/core";
import MediaLibraryFileBox from "./MediaLibraryFileBox.vue";
import {useMediaLibraryState, useMediaLibraryUploadState} from "./media_library_utils";
import MediaLibraryUploadModal from "./MediaLibraryUploadModal.vue";
import Spinner from "../Spinner.vue";
import {TCropperProps} from "../ImageCropper.vue";

const visible = defineModel<boolean>('visible', {
    required: true,
});

const props = withDefaults(defineProps<{
    maxSize?: number,
    config?: IM.MediaLibraryConfig,
    embed?: boolean,
    cropperProps?: Omit<TCropperProps, 'image' | 'width' | 'height'>,
    id: string,
}>(), {
    maxSize: 0,
    embed: false,
})

const urlParams = useUrlSearchParams();

const state = useMediaLibraryState(() => props.config);

const emit = defineEmits<{
    'update:visible': [boolean],
    'selected': [IM.SelectSizes],
}>();


let sizes = ref<IM.SelectFileResponse>();

function onSizeSelectionClose() {
    sizes.value = undefined;
}

const visibleSizeSelect = ref(false);

const getCurrentPath = () => state.activeDir?.directory ?? state.base_dir?.directory;

function disposeArgMediaLibrary() {
    state.loading = false;
    state.selection = undefined;
    sizes.value = undefined;
    visibleSizeSelect.value = false;
    emit('update:visible', false);
}

function showMessage(type: TAlert, message: string) {
    console.log('showMessage', type, message)
    showNotificationOpts({
        message: message,
        type: type,
        duration: 5000,
    })
}

let initialSetup = ref(true);

function init(filesOnly = false, folder = ''): Promise<void> {
    const path = (props.embed ? urlParams.dir : '') || folder || getCurrentPath() || state.config.baseDir;
    return state.apiPost<IM.SetupResponse>('setup', {
        path: path,
        filesOnly: filesOnly,
    }).then((res) => {
        const resData = res.data;
        if (initialSetup.value) {
            // console.log('initial setup')
            initialSetup.value = false;
            // currentPath.value ??= resData.base_dir.directory;
            state.base_dir = resData.base_dir;
            state.base_dir.open = true;
            state.activeDir = resData.directories.find(d => d.directory === path) ?? resData.base_dir;
            state.directories = [resData.base_dir].concat(resData.directories).sort((x, y) => x.directory.localeCompare(y.directory));
            (document.getElementById('files-grid'))?.scrollTo({top: 0, behavior: 'smooth'});
        } else if (!filesOnly) {
            const addedDirs = resData.directories.filter(d => !state.directories.find((dd) => dd.directory === d.directory));
            const removedDirs = state.directories.filter(d => d.directory != state.base_dir?.directory && !resData.directories.find(dd => dd.directory === d.directory));
            state.directories = state.directories.filter(d => !removedDirs.find(dd => dd.directory === d.directory))
                .concat(addedDirs)
                .toSorted((x, y) => x.directory.localeCompare(y.directory))
            state.base_dir = resData.base_dir;
            state.base_dir.open = true;
            // data.activeDir = resData.base_dir.id;
            // currentPath.value ??= resData.base_dir.directory;
        } else {
            const directory = state.directories.find(d => d.id === path);
            if (directory) {
                directory.fileCount = resData.files.length;
            }
        }
        state.files = resData.files.sort((x, y) => x.time - y.time)
        state.selection = undefined;


    }).catch(e => state.handleApiError(e, 'Couldn\'t initialize the media library!'));
}

function listenToImagePaste(event: ClipboardEvent) {
    const items = (event.clipboardData || (event as any).originalEvent.clipboardData || (window as any).clipboardData).items || [];
    for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const image = new Image();
                    image.src = e.target?.result as string;
                    image.onload = function (event) {
                        const el = event.target as HTMLImageElement;
                        uploadState.showModal(file, el, image);
                        return true;
                    };
                };
                reader.readAsDataURL(file);
                return;
            }
        }
    }
}

onMounted(() => {
    init();
    document.addEventListener('paste', listenToImagePaste);
});

onUnmounted(() => {
    document.removeEventListener('paste', listenToImagePaste);
});

function changePath(p: IM.Directory) {
    state.activeDir = p;
    // currentPath.value = p.directory;
    init(true);
}

function getShowSizes() {
    state.loading = true;
    state.apiPost<{ files: IM.SelectFileResponse[] }>('select-files', {
        path: getCurrentPath(),
        files: [state.selection!.name],
    }).then((res) => {
        const files = res.data.files;
        if (state.config.autoSizeSelector) {
            const res = state.config.autoSizeSelector(files[0]);
            if (res) {
                console.log('auto selected', res)
                emit('selected', res);
                visibleSizeSelect.value = false;
                emit('update:visible', false);
                return;
            }
        }
        console.log(files, sizes.value)


        files[0].values = Object.fromEntries(Object.entries(files[0].values).sort(([, a], [, b]) => a.width - b.width)); // sort by width
        sizes.value = files[0];
        state.loading = false;


        // if (files.length == 1) {
        if (files.values.length == 1) {
            selectAndClose();
        } else {
            visibleSizeSelect.value = true;
        }
    }).catch(e => state.handleApiError(e, 'Couldn\'t get the sizes of the selected file!'));
}

function selectAndClose() {
    console.log('selectAndClose', sizes.value!.values[sizes.value!.selected])
    emit('selected', sizes.value!.values[sizes.value!.selected])
    visibleSizeSelect.value = false;
    emit('update:visible', false);
    disposeArgMediaLibrary();
}

const uploadState = useMediaLibraryUploadState({
    id: props.id,
    cropperProps: props.cropperProps,
    forcedName: props.config?.forcedName,
    maxSize: props.maxSize,
    submit: (name: string, base64: string, ext: string) => {
        console.log('submit', name, ext)
        const formData = new FormData();
        formData.append('path', getCurrentPath() ?? '');
        formData.append(`files[0]`, base64);
        formData.append('settings', JSON.stringify([{
            name: name,
            format: ext,
        }]));

        const inputFile = document.getElementById('filePickerInput') as HTMLInputElement;
        state.apiPost('upload-files', formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        }).then(() => {
            console.log('uploaded')
            showMessage('success', `File has been uploaded to directory: ${getCurrentPath()}`)
            inputFile.value = '';
            console.log('uploaded2')
            console.log('uploaded3')
            uploadState.close();
            const div = document.getElementById('files-grid')!.parentElement as HTMLDivElement;
            div?.scrollTo({top: div.scrollHeight, behavior: 'smooth'});
            init(true);
        }).catch((r) => {
            inputFile.value = '';
            state.handleApiError(r);
        });
    }
});


function onFilePicked(event: Event) {
    console.log('onFilePicked')
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
        const file = files[0];

        if (!props.cropperProps && props.maxSize > 0 && file.size > props.maxSize) {
            showMessage('danger', `The selected file (${Math.ceil(file.size / 1024)} KB) is larger than max allowed size (${Math.ceil(props.maxSize / 1024)} KB)!`);
            target.value = '';
            return;
        }
        const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
        const ext = file.name.substring(file.name.lastIndexOf('.') + 1);
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase());

        console.log(originalName, ext, isImage)
        if (isImage) {
            const reader = new FileReader();
            reader.onload = function (e) {
                console.log('loaded')
                const image = new Image();
                image.src = e.target?.result as string;
                image.onload = function (event) {
                    const el = event.target as HTMLImageElement;
                    uploadState.showModal(file, el, image);
                    return true;
                };
            };
            console.log('readAsDataURL')
            reader.readAsDataURL(file);
        } else {
            uploadState.showModal(file);
        }
    }
}

function addSubfolder(dir: IM.Directory) {
    openConfirmationDialog({
        title: 'New Folder',
        message: `Please type the name of the new folder:`,
        prompt: {
            value: '',
            regex: /^[^\s^\x00-\x1f\\?*:";<>|\/.][^\x00-\x1f\\?*:";<>|\/]*[^\s^\x00-\x1f\\?*:";<>|\/.]*$/,
            invalidMessage: 'Invalid folder name',
        },
        onConfirm(value?: string) {
            state.apiPost('create-folder', {
                path: dir.directory,
                name: value,
            }).then(() => {
                showMessage('success', `Folder has been created: ${dir.directory}/${value}`)
                init().then(() => {
                    const addedFolder = state.directories.find(d => d.directory == dir.directory + '/' + value);
                    if (addedFolder) {
                        dir.inner = [...dir.inner, addedFolder.id].sort();
                        state.activeDir = addedFolder;
                        // currentPath.value = addedFolder.directory;
                    }
                });
            });
        },
    })
}

function rename(file: IM.FileInfo) {
    const pathWithoutName = file.path.substring(0, file.path.lastIndexOf('/'));
    openConfirmationDialog({
        title: 'Rename File',
        message: `Please type the new name for the file:`,
        prompt: {
            value: '' + file.name,
            regex: /^[^\s^\x00-\x1f\\?*:";<>|\/.][^\x00-\x1f\\?*:";<>|\/]*[^\s^\x00-\x1f\\?*:";<>|\/.]*$/,
            invalidMessage: 'Invalid file name',
        },
        onConfirm(value?: string) {
            state.apiPost('rename-file', {
                old: pathWithoutName + '/' + file.name,
                new: pathWithoutName + '/' + value,
            }).then(() => {
                file.url = Object.fromEntries(
                    Object.entries(file.url)
                        .map(([k, v]) => [k, v.replace('/' + file.name, '/' + value!)])
                );
                file.name = value!;
                file.path = pathWithoutName + '/' + value;
                console.log(file)
                showMessage('success', `File has been renamed: '${file.name}' -> '${value}'`)
            });
        },
    })
}

function renameFolder(dir: IM.Directory) {
    console.log(dir)
    openConfirmationDialog({
        title: 'Rename Folder',
        message: `Please type the new name for the folder:`,
        prompt: {
            value: '' + dir.path.basename,
            regex: /^[^\s^\x00-\x1f\\?*:";<>|\/.][^\x00-\x1f\\?*:";<>|\/]*[^\s^\x00-\x1f\\?*:";<>|\/.]*$/,
            invalidMessage: 'Invalid folder name',
        },
        onConfirm(value?: string) {
            state.apiPost<string>('rename-file', {
                old: dir.path.dirname + '/' + dir.path.basename,
                new: dir.path.dirname + '/' + value,
            }).then((res) => {
                showMessage('success', `Folder has been renamed: '${dir.directory}' -> '${value}'`)
                init(false, res.data).then(() => {
                    const renamedDir = state.directories.find(d => d.directory == res.data);
                    changePath(renamedDir!);
                });
            });
        },
    })
}

function deleteFolder(dir: IM.Directory) {
    const siblings = state.directories.filter(d => d.parent_id === dir.parent_id);
    state.apiPost('delete-folder', {
        folder: dir.directory,
    }).then(() => {
        showMessage('success', `Folder has been deleted: ${dir.directory}`)
        const parent = state.directories.find(d => d.id == dir.parent_id);
        if (parent) {
            parent.inner = parent.inner.filter(d => d !== dir.id);
        }
        init().then(() => {
            if (siblings.length == 1) {
                if (parent)
                    state.activeDir = parent;
            } else {
                const dirIndex = siblings.findIndex(d => d.id === dir.id);
                let activeSibling;
                if (dirIndex >= 1) {
                    activeSibling = siblings[dirIndex - 1];
                } else if (dirIndex < siblings.length - 1) {
                    activeSibling = siblings[dirIndex + 1];
                } else {
                    activeSibling = siblings[0];
                }
                state.activeDir = activeSibling;
                // currentPath.value = activeSibling.directory;
            }
        });
    });
}

const hostname = window.location.protocol + '//' + window.location.hostname;

function copyPathToClipboard(file: IM.FileInfo) {
    copyToClipboard(`${hostname}/${file.path}`)
        .then(() => showMessage('success', 'Path has been copied to clipboard!'))
        .catch((x) => showMessage('danger', 'Path couldn\'t be copied to clipboard! Reason: ' + x));
}

function triggerFileInput() {
    document.getElementById('filePickerInput')?.click()
}

</script>
<template>
    <component
        :is="embed ? 'div' : CenteredModal"
        v-model:show="visible"
        @close="disposeArgMediaLibrary()"
        class="arg-media-library"
        :id="'arg-media-library-' + id"
        content-style="width: 95vw; height: 85vh; max-height: 85vh;"
        content-class="flex flex-col bg-x0"
        :closeOnOutside="false"
    >
        <!-- header -->
        <div class="flex items-center px-5 pt-3 border-b border-x2 pb-2">
            <h5 class="text-xl font-bold">
                Arg Media Library
                <span class="inline ml-2" role="status" v-if="state.loading">
                    <svg class="animate-spin inline h-5 w-5 text-gray-900 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="sr-only">Loading...</span>
                </span>
            </h5>
            {{ id }}
            <div class="flex-1 flex text-sm pl-3 pr-10 truncate">
                <div class="text-sm bg-x2 px-3 truncate rounded">Extensions: {{ state.config.extensions.join(', ') }}</div>
            </div>
            <button v-if="!embed" @click.prevent="disposeArgMediaLibrary()" class="btn btn-secondary rounded-full p-1">
                <span class="icon icon-[mdi--remove]"></span>
            </button>
        </div>

        <div v-if="!initialSetup" class="flex-1 h-full flex max-md:flex-col gap-3 relative overflow-y-auto p-2">
            <!--directories-->
            <DirectoryTree
                class="lg:border-r border-x2 lg:pr-2 w-full md:w-1/3 overflow-y-auto scrollbar-thin max-md:h-1/3 "
                :directories="state.directories"
                :active="state.activeDir"
                @selected="changePath"
                @renameFolder="renameFolder"
                @deleteFolder="deleteFolder"
                @createSubfolder="addSubfolder"/>

            <!--files-->
            <div class="max-sm:pt-2 lg:pt-0 lg:pl-2 w-full md:w-2/3 max-md:h-2/3 overflow-y-auto scrollbar-thin flex flex-col">
                <!--<div class="flex gap-2 truncate">Path: <div class="flex-1 truncate">{{ data.activeDir?.directory }}</div></div>-->
                <DirectoryPath
                    v-if="state.activeDir"
                    :current="state.activeDir"
                    :all-dirs="state.directories"
                    @addFile="triggerFileInput"
                    @visitDir="changePath"/>
                <div class="flex-1 overflow-y-auto scrollbar-thin">
                    <div id="files-grid" class="flex-1 w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 pr-2 pb-2 items-start" v-auto-animate>
                        <template v-for="subDir in state.directories.filter(t => state.activeDir.inner?.includes(t.id))" :key="subDir.id">
                            <div class="flex justify-center">
                                <div class="relative group border border-x4 shadow shadow-x4 img-thumbnail cursor-pointer overflow-hidden border-base"
                                     :style="`width: min(100%, 150px); aspect-ratio: ${state.config.baseSize.aspectRatio};`"
                                     @click.prevent="changePath(subDir)"
                                >
                                    <div class="absolute inset-0 h-full w-full grid place-items-center pb-2">
                                        <span class="icon icon-[mdi--folder-open] h-14 w-14 text-green-900"></span>
                                    </div>
                                    <div class="absolute inset-0 h-full w-full flex items-end" style="padding-bottom: 0.4em">
                                        <div class="line-clamp-2 w-full text-sm text-center leading-tight" style="height: 2.5em">{{ subDir.path.basename }}</div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-for="f in state.files" :key="f.path">
                            <MediaLibraryFileBox
                                :path="getCurrentPath()"
                                :f="f"
                                :state="state"
                                @deleted="init(true)"
                                @selected="state.selection = state.selection == f ? undefined : f"
                            />
                        </template>
                        <div class="flex justify-center">
                            <label class="flex justify-center items-center border border-x7 group relative cursor-pointer" title="New File"
                                   :style="`width: min(100%, 150px); aspect-ratio: ${state.config.baseSize.aspectRatio};`" for="filePickerInput">
                                <span class="icon icon-[mdi--add-circle] opacity-80 w-12 h-12"></span>
                                <span class="group-hover:opacity-100 opacity-0 transition-opacity absolute inset-0 bg-reverse/10"></span>
                                <input
                                    type="file"
                                    class="hidden"
                                    id="filePickerInput"
                                    :accept="state.config.extensions.map(e => '.'+e).join(', ')"
                                    @change.prevent="onFilePicked">
                            </label>
                        </div>
                    </div>
                </div>
                <div class="flex justify-between mt-4 items-end">
                    <div class="flex-1 pr-4 truncate" style="min-height: 10px;">
                        <div v-if="state.selection" class="border border-x5 p-2 bg-x2 rounded">
                            <!--<div class="font-bold">{{ selection.name }}</div>-->
                            <div class="text-sm leading-tight flex items-center gap-1 max-w-full truncate">
                                <span class="font-bold">{{ state.selection.name }} </span>
                                <button class="icon icon-[mdi--edit] btn-link" @click.prevent="rename(state.selection)"></button>
                            </div>
                            <div class="text-sm leading-tight flex items-center gap-1 max-w-full truncate">
                                <span class="truncate">{{ hostname }}/{{ state.selection.path }} </span>
                                <button v-if="hasClipboard" class="icon icon-[mdi--content-copy] btn-link" @click.prevent="copyPathToClipboard(state.selection)"></button>
                                <a class="icon icon-[mdi--external-link] btn-link" target="_blank" :href="`${hostname}/${state.selection.path}`"></a>
                            </div>
                            <div class="text-sm leading-tight">{{ dayjs(state.selection.time).toString() }}</div>
                            <div class="text-sm leading-tight">{{ sizeToString(state.selection.size) }}</div>
                        </div>
                    </div>
                    <button v-if="!embed" class="btn btn-success" :class="!state.selection ? '!opacity-50' : ''" :disabled="!state.selection" @click.prevent="getShowSizes"> Select</button>
                </div>
            </div>
        </div>
        <div v-else class="w-full h-96 grid place-items-center">
            <Spinner loading svg-size="w-24"/>
        </div>

        <!--size selection modal-->
        <CenteredModal
            :show="visibleSizeSelect"
            content-class="flex flex-col px-5 pt-5"
            content-style="width: min(85vw, 600px)"
            title="Select the size"
            tag="size-selection-modal"
            :close-on-outside="false"
            @close="onSizeSelectionClose"
            v-if="sizes"
        >
            <div class="flex-1 h-full flex flex-col lg:flex-row gap-3">
                <div class="w-full lg:w-4/12">
                    <img :src="sizes.values[sizes.selected].url" alt="-" class="w-full img img-thumbnail border border-x5">
                </div>
                <div class="w-full lg:w-8/12 grid grid-cols-2 gap-2">
                    <template v-for="sizeName in Object.keys(sizes.values)" :key="sizeName">
                        <button class="alert border py-1 m-0" @click.prevent="sizes.selected = sizeName"
                                :class="(sizes.selected === sizeName ? 'alert-success ' : 'alert-light')">
                            {{ sizeName.toUpperCase() }} <br> ({{ sizes.values[sizeName]?.size }})
                        </button>
                    </template>
                </div>
            </div>

            <footer class="dialog-footer flex justify-end gap-3 px-0 py-3 ">
                <button class="btn btn-light py-0.5 rounded text-base font-normal lowercase" @click.prevent="visibleSizeSelect = false">
                    Cancel
                </button>
                <button class="btn btn-primary py-0.5 rounded text-base font-normal lowercase" @click.prevent="selectAndClose">
                    Select
                </button>
            </footer>
        </CenteredModal>

        <MediaLibraryUploadModal
            :state="uploadState"
        >
        </MediaLibraryUploadModal>

    </component>
</template>
