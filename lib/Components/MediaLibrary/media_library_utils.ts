import {computed, reactive, watch} from "vue";
import {imgTestData} from "./test_data";
import {useUrlSearchParams} from "@vueuse/core";
import {api} from "../../utils";
import {AxiosError, AxiosRequestConfig} from "axios";
import {showNotificationOpts} from "../Overlays";
import {defaultMediaLibraryConfig, Directory, FileInfo, MediaLibraryConfig} from "./media-library-types";


type TEndpoints = 'setup'|'select-files'|'upload-files'|'create-folder'|'delete-files'|'delete-folder'|'rename-file';

export function useMediaLibrary(config?: () => MediaLibraryConfig, embed?: boolean) {
    const urlParams = embed ? useUrlSearchParams() : undefined;
    const state = reactive({
        loading: false,
        config: computed(() => config?.() ?? defaultMediaLibraryConfig),

        activeDir: {} as Directory,
        base_dir: undefined as Directory|undefined,
        directories: [] as Directory[],
        files: [] as FileInfo[],
        selected: [],
        // activeDir: imgTestData.base_dir as Directory,
        // base_dir: imgTestData.base_dir,
        // directories: imgTestData.directories as Directory[],
        // files: imgTestData.files,
        // selected: imgTestData.files,
        selection: imgTestData.files[0] as FileInfo|undefined,

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

    if(urlParams){
        watch(() => state.activeDir, (v) => {
            urlParams.dir = v?.directory ?? '';
        })
    }

    return state;
}
export type MediaLibraryState = ReturnType<typeof useMediaLibrary>;