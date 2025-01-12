import {computed, reactive, ref, unref, watch} from "vue";
import {useUrlSearchParams} from "@vueuse/core";
import {api} from "../../utils";
import {AxiosError, AxiosRequestConfig} from "axios";
import {showNotificationOpts} from "../Overlays";
import {defaultMediaLibraryConfig, Directory, FileInfo, MediaLibraryConfig} from "./media-library-types";
import {defineStore} from "pinia";
import {TCropperProps} from "../ImageCropper.vue";


type TEndpoints = 'setup' | 'select-files' | 'upload-files' | 'create-folder' | 'delete-files' | 'delete-folder' | 'rename-file';

export function useMediaLibraryState(config?: () => MediaLibraryConfig | undefined, embed?: boolean) {
    const urlParams = embed ? useUrlSearchParams() : undefined;
    const state = reactive({
        loading: false,
        config: computed(() => config?.() ?? defaultMediaLibraryConfig),

        activeDir: {} as Directory,
        base_dir: undefined as Directory | undefined,
        directories: [] as Directory[],
        files: [] as FileInfo[],
        selected: [],
        // activeDir: imgTestData.base_dir as Directory,
        // base_dir: imgTestData.base_dir,
        // directories: imgTestData.directories as Directory[],
        // files: imgTestData.files,
        // selected: imgTestData.files,
        selection: undefined as FileInfo | undefined,

        async apiPost<T>(endpoint: TEndpoints, data: FormData | Record<string, any>, axiosConfig?: AxiosRequestConfig) {
            const url = route(`arg-media-library.${endpoint}`);
            if (data instanceof FormData) {
                data.append('config', JSON.stringify(state.config));
            } else {
                data = {config: state.config, ...data};
            }
            try {
                state.loading = true;
                return await api.post<T>(url, data, axiosConfig);
            } finally {
                state.loading = false;
            }
        },
        handleApiError(r: AxiosError, message?: string, duration = 5000) {
            console.error(r)
            const msg = (r.response?.data as any)?.['message'] ?? r.message ?? 'no message provided!';
            showNotificationOpts({
                message: message ?? window.__('something_went_wrong') + ': ' + msg,
                type: 'danger',
                duration: duration,
            })
        }
    })

    if (urlParams) {
        watch(() => state.activeDir, (v) => {
            urlParams.dir = v?.directory ?? '';
        })
    }

    return state;
}

export type MediaLibraryState = ReturnType<typeof useMediaLibraryState>;


export function useMediaLibraryUploadState(opts: {
    id: string,
    forcedName?: () => string,
    cropperProps?: Omit<TCropperProps, 'image' | 'width' | 'height'>,
    maxSize?: number,
    submit: (name: string, base64: string, ext: string) => void
}) {
    const {id, forcedName, cropperProps, maxSize, submit} = opts;
    // const uploadModalData = reactive({
    //     visible: false,
    //     file: undefined as File | undefined,
    //     fileAsStr: '',
    //     size: {width: 0, height: 0}
    // })
    return defineStore(id, () => {
        const visible = ref(false);
        const _file = ref<File | undefined>(undefined);
        const fileAsStr = ref('');
        const size = ref({width: 0, height: 0});

        function showModal(file: File, el?: HTMLImageElement, img?: HTMLImageElement) {
            _file.value = file;
            fileAsStr.value = img?.src ?? '';
            form.unrefFileAsStr = '' + unref(fileAsStr.value)
            originalName.value = file?.name.substring(0, file.name.lastIndexOf('.')) || ''
            size.value = {width: el?.width ?? 0, height: el?.height ?? 0};
            visible.value = true;
        }

        const originalName = ref(_file.value?.name.substring(0, _file.value.name.lastIndexOf('.')) || '')

        const form = reactive({
            name: computed({
                get: () => forcedName?.() || originalName.value,
                set: (v) => {
                    console.log('setting name', v)
                    if (forcedName?.()) return;
                    return originalName.value = v;
                }
            }),
            unrefFileAsStr: '' + unref(fileAsStr.value),
            image: computed({
                get: () => fileAsStr.value,
                set: (v) => fileAsStr.value = v
            }),
            errors: {} as Record<'name' | 'image', string>
        })

        function _submit() {
            if (maxSize) {
                const sizeInBytes = new Blob([form.image!]).size
                console.log('size', sizeInBytes, maxSize)
                if (sizeInBytes > maxSize) {
                    form.errors.image = `File size is too big. Max size is ${(maxSize / 1024).toFixed(2)} KB but the file is ${(sizeInBytes / 1024).toFixed(2)} KB`
                    return false
                }
            }
            console.log('submitting')

            // fileAsStr.value = form.image

            const ext = _file.value!.name.split('.').pop()
            submit(form.name, fileAsStr.value, ext!)
        }

        return {
            id,
            isVisible: computed(() => visible.value),
            close: () => visible.value = false,
            hasFile: computed(() => !!_file.value),
            canEditName: computed(() => !forcedName),
            fileAsStr,
            size,
            cropperProps,
            maxSize,
            form,
            originalName,
            showModal,
            submit: _submit,
        };
    })();
}

export type TUploadState = ReturnType<typeof useMediaLibraryUploadState>;