export type ConfigSize = {
    /**
     * key or name of the size. e.g. 'Small' or 'Original'
     */
    name: string,
    /**
     * suffix to add to the filename. e.g. '-sm' for small images or '' for the original
     */
    nameSuffix: string,
    /**
     * between 0 and 100
     */
    scale: number,
    aspectRatio?: number,
    uploadConstraints?: {
        max: { width: number } | { height: number } | {
            width: number,
            height: number,
        }
    } | {
        required: {
            width: number,
            height: number,
        }
    },
}
export type MediaLibraryConfig = {
    forcedName?: () => string,
    baseDir: string,
    baseSize: ConfigSize,
    resizes: ConfigSize[],
    extensions: string[],
    autoSizeSelector?: ((response: SelectFileResponse) => any) | undefined,
}

export type Directory = {
    directory: string,
    id: string,
    indent: number,
    inner: Array<string>,
    parent_id?: string,
    path: {
        basename: string,
        dirname: string,
        filename: string,
    },
    url_base: string,
    open?: boolean,
    fileCount?: number,
}
export type SelectSizes = {
    height: number,
    width: number,
    size: string,
    url: string,
    path: string,
}
export type SelectFileResponse = {
    // images: Array<{
    fileNameNoSuffix: string,
    aspectRatio: number,
    select: SelectSizes,
    selected: string,
    values: { [key: string]: SelectSizes },
    // }>,
}
export type FileInfo = {
    name: string,
    path: string,
    time: number,
    size: number,
    url: {
        [name: string]: string,
    }
}
export type SetupResponse = {
    base_dir: Directory,
    directories: Array<Directory>,
    files: Array<FileInfo>,
}


export const mediaLibraryDefaultSize = {name: 'Original', nameSuffix: '', aspectRatio: 1, scale: 100};

export const defaultMediaLibraryConfig: MediaLibraryConfig = {
    baseDir: 'uploads',
    baseSize: mediaLibraryDefaultSize,
    resizes: [],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
}
export const defaultMediaLibraryConfigWithPdf: MediaLibraryConfig = {
    baseDir: 'uploads',
    baseSize: mediaLibraryDefaultSize,
    resizes: [],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
}
export const defaultMediaLibraryConfigWithResizes: MediaLibraryConfig = {
    baseDir: 'uploads',
    baseSize: mediaLibraryDefaultSize,
    resizes: [
        {name: 'Large', nameSuffix: '-xl', scale: 125},
        {name: 'Medium', nameSuffix: '-md', scale: 75},
        {name: 'Small', nameSuffix: '-sm', scale: 50},
    ],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
}