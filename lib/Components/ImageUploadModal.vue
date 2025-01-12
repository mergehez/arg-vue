<script setup lang="ts">

import {CenteredModal, ImageCropper, LoadingButton} from "./";
import {ref} from "vue";
import {TApiError} from "../utils";

const __ = window.__;

const props = withDefaults(defineProps<{
    btnText: string,
    aspectRatio?: number,
    minHeight?: number,
    minWidth?: number,
    circle?: boolean,
    uploadFunc: (imgData: string) => Promise<string>,
    useCropper?: boolean,
    noTransparency?: boolean,
}>(), {
    minHeight: 250,
    minWidth: 250,
    useCropper: true,
})
const emit = defineEmits<{ change: [src: string] }>();

const photoInput = ref<HTMLInputElement>();
const showImageCropper = ref(false);
const croppedImage = ref();
const selectedImage = ref('');
const selectedImageWidth = ref(0);
const selectedImageHeight = ref(0);
const errorMessage = ref('');

const selectNewPhoto = () => {
    photoInput.value?.click();
};
const updatePhotoPreview = () => {
    const photo = photoInput.value!.files?.[0];
    if (!photo) return;

    const reader = new FileReader();

    const ratio = Math.min(window.innerWidth / (props.minWidth * 2), window.innerHeight / (props.minHeight * 2));
    const maxWidth = (props.minWidth * 2) * ratio * 0.90;
    const maxHeight = (props.minHeight * 2) * ratio * 0.90;
    reader.onload = function (e) {
        const image = new Image();
        const src = e.target!.result as string;
        image.src = src;
        image.onload = function (event) {
            const el = event.target as HTMLImageElement;
            const ratio = Math.min(maxWidth / el.width, maxHeight / el.height);
            selectedImageWidth.value = el.width * ratio;
            selectedImageHeight.value = el.height * ratio;

            selectedImage.value = src
            showImageCropper.value = true;
            if (!props.useCropper) {
                emit('change', selectedImage.value);
                toggleModal(false);
            }
            return true;
        };
    };

    reader.readAsDataURL(photo);
};

const isUploading = ref(false);
const cropAndUpload = () => {
    errorMessage.value = '';
    isUploading.value = true;
    props.uploadFunc(props.useCropper ? croppedImage.value : selectedImage.value)
        .then(img => {
            emit('change', img);
            toggleModal(false);
        }).catch((err: TApiError) => {
        errorMessage.value = (err.response?.data as any ?? err)?.message;
    }).finally(() => isUploading.value = false);
}

function toggleModal(show: boolean) {
    showImageCropper.value = show;
    if (photoInput.value?.value) {
        photoInput.value.value = '';
    }
}
</script>

<template>
    <input
        ref="photoInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="updatePhotoPreview"
    >
    <button class="btn py-1 btn-secondary" @click.prevent="selectNewPhoto">{{ btnText }}</button>
    <CenteredModal :show="showImageCropper" @update:show="toggleModal" :close-on-outside="false" tag="img-upload">
        <div class="px-4 pb-4 pt-5 sm:p-6 sm:pb-4 flex-grow h-full" :style="`height: ${selectedImageHeight}px; width:${selectedImageWidth}px`">
            <ImageCropper
                v-if="useCropper"
                :image="selectedImage"
                :width="selectedImageWidth"
                :height="selectedImageHeight"
                v-model="croppedImage"
                :aspect-ratio="aspectRatio ?? (minWidth/(minHeight || 1))"
                :min-height="minHeight"
                :min-width="minWidth"
                :circle="circle"
                :noTransparency/>
            <div v-else>
                <img :src="selectedImage" alt="image to upload">
            </div>
        </div>
        <div class="pb-3 px-6 flex gap-2" style="z-index: 2">
            <div v-if="errorMessage" class="text-red-500">{{ errorMessage }}</div>
            <i class="flex-1"></i>
            <button class="btn py-1 btn-light" @click.prevent="toggleModal(false)">{{ __('back') }}</button>
            <LoadingButton :loading="isUploading" class="btn py-1 btn-success" @click.prevent="cropAndUpload">{{ __('change') }}</LoadingButton>
        </div>
    </CenteredModal>
</template>
