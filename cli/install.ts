#!/usr/bin/env node

import path from "path";
import fs from "node:fs";
import {execSync} from "node:child_process";

const isAct = process.argv.includes("--act");

function writeFileOrAct(file: string, content: string | NodeJS.ArrayBufferView){
    if(isAct) {
        console.log(`Act: writeFile '${file}'`);
    }else{
        fs.writeFileSync(file, content);
    }
}

function execOrAct(command: string){
    if(isAct) {
        console.log(`Act: exec '${command}'`);
    }else{
        execSync(command);
    }
}

function mkdirOrAct(dir: string, options?: fs.MakeDirectoryOptions){
    if(isAct) {
        console.log(`Act: mkdir '${dir}'`);
    }else{
        fs.mkdirSync(dir, options);
    }
}

let composer = JSON.parse(fs.readFileSync("./composer.json").toString());
composer.repositories = composer.repositories || [];
composer.repositories.push({ type: "path", url: "../arg-laravel" });
composer.require["arg-laravel"] = "*";
composer["minimum-stability"] = "dev";
writeFileOrAct("./composer.json", JSON.stringify(composer, null, 4));

execOrAct(`bun install -D ${[
    "tailwindcss",
    "postcss",
    "autoprefixer",
    "sass",
    "typescript",
    "@iconify/tailwind",
    "@iconify-icons/mdi",
    "@iconify-icons/ic",
    "@iconify-icons/fluent",
    "@iconify-icons/fa6-solid",
    "@mergehez/build",
    "vue",
    "@vitejs/plugin-vue",
].join(" ")}`);

execOrAct(`bun install ${[
    "dayjs",
    "pinia",
    "@vueuse/core",
    "@vueuse/components",
    "tailwind-merge",
    "latinize",
    "@formkit/auto-animate",
    "@inertiajs/vue3",
].join(" ")}`);

execOrAct(`composer require ${[
    "inertiajs/inertia-laravel",
    "ralphjsmit/laravel-seo",
    "tightenco/ziggy",
].join(" ")}`);

execOrAct(`composer require --dev ${[
    "barryvdh/laravel-debugbar",
].join(" ")}`);

execOrAct(`tailwindcss init -p`);


const filesToCopy = {
    'app/Console/Commands/Transformer.php' : undefined,
    'app/Enums/AppDisplayLang.php' : undefined,
    'app/Enums/KeyValueKey.php' : undefined,
    'app/Http/Controllers/Controller.php' : undefined,
    'app/Http/Controllers/SearchController.php' : undefined,
    'app/Http/Controllers/PanelController.php' : undefined,
    'app/Http/Controllers/SliderController.php' : undefined,
    'app/Http/Controllers/SliderItemController.php' : undefined,
    'app/Http/Controllers/UserController.php' : undefined,
    'app/Models/KeyValue.php' : undefined,
    'app/Models/Seo.php' : undefined,
    'app/Models/Slider.php' : undefined,
    'app/Models/SliderItem.php' : undefined,
    'app/Providers/AppServiceProvider.php' : undefined,
    'resources/views/app.blade.php' : undefined,
    'resources/sass/app.scss' : undefined,
    'resources/sass/components.scss' : undefined,
    'resources/sass/colors.scss' : undefined,
    'resources/js/app.js' : undefined,
    'resources/js/theme_setup.js' : undefined,
    'resources/js/Types/inertia.d.ts' : undefined,
    'resources/js/Helpers/argvue_helper.ts' : undefined,
    'resources/js/Helpers/form_helpers.ts' : undefined,
    'resources/js/Helpers/globalState.ts' : undefined,
    'resources/js/Helpers/inertia_helpers.ts' : undefined,
    'resources/js/Components/AppLayout.vue' : undefined,
    'resources/js/Components/AppLayoutPanel.vue' : undefined,
    'resources/js/Components/AppLayoutMain.vue' : undefined,
    'resources/js/Components/Nav.vue' : undefined,
    'resources/js/Components/NavButton.vue' : undefined,
    'resources/js/Components/NavLink.vue' : undefined,
    'resources/js/Pages/Auth/PageLogin.vue' : undefined,
    'tailwind.config.js' : undefined,
    'tsconfig.json' : undefined,
    'vite.config.js' : undefined,
}

for (let file in filesToCopy) {
    if(file.includes('/')){
        mkdirOrAct(path.dirname('./'+file), { recursive: true });
    }
    let stubName = filesToCopy[file];
    if(stubName === undefined){
        stubName = file.split('/').pop();
    }
    if(isAct){
        console.log(`Act: copy stub from 'stubs/${stubName}.stub' to '${file}'`);
    }else{
        writeFileOrAct('./'+file, fs.readFileSync(path.resolve(__dirname, `stubs/${stubName}.stub`)));
    }
}


let userModel = fs.readFileSync('./app/Models/User.php').toString();
if(userModel.includes('class User extends')){
    if(userModel.includes('implements')){
        userModel = userModel.replace('implements', 'implements IUser, ');
    }else{
        userModel = userModel.replace(/class User extends.*\n/, '$& implements IUser\n');
    }

    userModel = userModel.replace(' as Authenticatable;', ' as Authenticatable;\nuse Arg\\Laravel\\Contracts\\IUser;');
}
writeFileOrAct('./app/Models/User.php', userModel);


let bootstrap = fs.readFileSync('./bootstrap/app.php').toString();
bootstrap = bootstrap.replace(
    'use Illuminate\\Foundation\\Application;',
    'use App\\Http\\Middleware\\HandleInertiaRequests;\n' +
                    'use Arg\\Laravel\\Support\\Arg;\n' +
                    'use Illuminate\\Foundation\\Application;'
);
bootstrap = bootstrap.replace(
    '->withMiddleware(function (Middleware $middleware) {',
    '->withMiddleware(function (Middleware $middleware) {\n\t\t' +
                    'Arg::registerMiddlewares($middleware, HandleInertiaRequests::class);'
);
writeFileOrAct('./bootstrap/app.php', bootstrap);
