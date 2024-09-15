import { build } from "esbuild";
import { readFileSync } from "fs"

const pkg = JSON.parse( readFileSync( new URL('./package.json', import.meta.url) ).toString());

const sharedConfig = {
    bundle: true,
    minify: false,
    platform: 'node',
    format: 'esm',
    external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.peerDependencies || {})
    ],
};

await build({
    ...sharedConfig,
    outfile: "lib/install.mjs",
    entryPoints: ["cli/install.ts"],
});


// await build({
//     ...sharedConfig,
//     outfile: "dist/ftp-deploy.mjs",
//     entryPoints: ["cli/ftp-deploy/index.ts"],
//     plugins: [
//         {
//             name: "ImportFtpIgnorePlugin",
//             setup(build) {
//                 build.onLoad({ filter: /ftp-deploy-(.*)\.yml$/ }, async (args) => {
//                     return { loader: "text", contents: readFileSync(args.path).toString() }
//                 })
//             }
//         },
//     ]
// });
