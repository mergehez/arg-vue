<script setup lang="ts">
import * as IM from "./media-library-types";
import {confirmModalState as state, onConfirmationPromptValueChange, openConfirmationDialog, showNotificationOpts} from "../Overlays";
import {MediaLibraryState} from "./media_library_utils";
import {computed, ref, watch} from "vue";
import CenteredModal from "../Overlays/CenteredModal.vue";
import ImageCropper from "../ImageCropper.vue";
import {InputError, TextInput} from "../Form";
import {useForm} from "@inertiajs/vue3";

const visible = defineModel('visible', {
    default: false,
})

const props = defineProps<{
    file?: File,
    fileAsStr: string,
    size: {width: number, height: number},
}>()

const originalName = computed(() => props.file?.name.substring(0, props.file.name.lastIndexOf('.')) ?? '')
// const ext = computed(() => props.file.name.substring(props.file.name.lastIndexOf('.') + 1))
// const isImage = computed(() => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.value.toLowerCase()))

const emit = defineEmits<{

}>();

const form = useForm({
    name: originalName.value,
    image: props.fileAsStr,
})

watch(() => props.file, (nv) => {
    form.image = props.fileAsStr
    form.name = originalName.value
})

function submit(){
    console.log('submit', form.data())
}

const __ = window.__;
</script>

<template>
    <CenteredModal
        v-model:show="visible"
        content-class="flex flex-col w-10/12 lg:w-6/12"
        content-style="min-width: 400px"
        title="Select the size"
        :close-on-outside="false"
    >
        <header class="flex p-5">
            <h3 class="text-xl">Upload File</h3>

            <button class="btn btn-secondary rounded-full p-1 ml-auto" @click="visible = false">
                <span class="icon icon-[mdi--remove]"></span>
            </button>
        </header>

        <div v-if="file">
            <div v-if="fileAsStr" style="max-width: 95vw;" class="px-5 flex justify-center mb-4">
                <img
                    :src="fileAsStr"
                    style="max-height: 40vh; max-width: 100%;"
                    alt="...">
            </div>
            <div class="px-5">
                <div class="text-sm">
                    Original name of the file is: <b>{{ originalName }}</b>. You can change it here:
                </div>

                <TextInput
                    class="w-full mt-1"
                    v-model="form.name"
                />
                <InputError :message="form.errors.name" />
            </div>
        </div>

        <footer class="dialog-footer flex justify-end gap-3 px-5 py-3">
            <button class="btn btn-light py-0.5 rounded text-sm font-normal lowercase" @click="visible = false">
                {{ __('cancel') }}
            </button>
            <button class="btn btn-primary py-0.5 rounded text-sm font-normal lowercase" @click="submit">
                {{ __('upload') }}
            </button>
        </footer>
    </CenteredModal>
</template>
