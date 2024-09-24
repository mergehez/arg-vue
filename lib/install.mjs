#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import path from "path";
import fs from "node:fs";
import {execSync} from "node:child_process";

const isAct = process.argv.includes("--act");

function writeFileOrAct(file, content){
  if(isAct) {
    console.info(`Act: writeFile '${file}'`);
  }else{
    fs.writeFileSync(file, content);
  }
}

function execOrAct(command){
  if(isAct) {
    console.info(`Act: exec '${command}'`);
  }else{
    execSync(command);
  }
}

function mkdirOrAct(dir, options){
  if(isAct) {
    console.info(`Act: mkdir '${dir}'`);
  }else{
    fs.mkdirSync(dir, options);
  }
}

let composer = JSON.parse(fs.readFileSync("./composer.json").toString());
composer.repositories = composer.repositories || [];
composer.repositories.push({ type: "path", url: "../arg-laravel" });
composer.require["mergehez/arg-laravel"] = "*";
composer.require["php"] = "^8.3";
composer["minimum-stability"] = "dev";
writeFileOrAct("./composer.json", JSON.stringify(composer, null, 4));
execOrAct("composer update");

execOrAct(`bun install -D ${[
  "tailwindcss",
  "@tailwindcss/forms",
  "postcss",
  "autoprefixer",
  "sass",
  "typescript",
  "@iconify/tailwind",
  "@iconify-json/mdi",
  "@iconify-json/ic",
  "@iconify-json/fluent",
  "@iconify-json/fa6-solid",
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
  "ziggy-js",
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
  'app/Http/Controllers/IndexController.php' : undefined,
  'app/Http/Controllers/SearchController.php' : undefined,
  'app/Http/Controllers/PanelController.php' : undefined,
  'app/Http/Controllers/SliderController.php' : undefined,
  'app/Http/Controllers/SliderItemController.php' : undefined,
  'app/Http/Controllers/UserController.php' : undefined,
  'app/Http/Middleware/HandleInertiaRequests.php' : undefined,
  'app/Models/KeyValue.php' : undefined,
  'app/Models/Seo.php' : undefined,
  'app/Models/Slider.php' : undefined,
  'app/Models/SliderItem.php' : undefined,
  'app/Providers/AppServiceProvider.php' : undefined,
  'lang/en.json' : undefined,
  'lang/de.json' : undefined,
  'lang/tr.json' : undefined,
  'lang/kmr.json' : undefined,
  'lang/zza.json' : undefined,
  'database/migrations/0001_01_01_000002_create_key_values_table.php' : undefined,
  'database/migrations/0001_01_01_000002_create_seos_table.php' : undefined,
  'database/migrations/0001_01_01_000002_create_sliders_table.php' : undefined,
  'database/seeders/DatabaseSeeder.php' : undefined,
  'public/logo.png' : undefined,
  'resources/views/app.blade.php' : undefined,
  'resources/sass/app.scss' : undefined,
  'resources/sass/components.scss' : undefined,
  'resources/sass/colors.scss' : undefined,
  'resources/js/app.js' : undefined,
  'resources/js/theme_setup.js' : undefined,
  'resources/js/Types/app.d.ts' : undefined,
  'resources/js/Types/inertia.d.ts' : undefined,
  'resources/js/Types/Models.ts' : undefined,
  'resources/js/Helpers/argvue_helper.ts' : undefined,
  'resources/js/Helpers/form_helpers.ts' : undefined,
  'resources/js/Helpers/globalState.ts' : undefined,
  'resources/js/Helpers/inertia_helpers.ts' : undefined,
  'resources/js/Helpers/slider_helpers.ts' : undefined,
  'resources/js/Components/AppLayout.vue' : undefined,
  'resources/js/Components/AppLayoutPanel.vue' : undefined,
  'resources/js/Components/AppLayoutMain.vue' : undefined,
  'resources/js/Components/Logo.vue' : undefined,
  'resources/js/Components/Nav.vue' : undefined,
  'resources/js/Components/NavButton.vue' : undefined,
  'resources/js/Components/NavLink.vue' : undefined,
  'resources/js/Components/NavPanel.vue' : undefined,
  'resources/js/Components/PanelTable.vue' : undefined,
  'resources/js/Pages/Auth/PageLogin.vue' : undefined,
  'resources/js/Pages/Frontend/PageIndex.vue' : undefined,
  'resources/js/Pages/Panel/PanelMediaLibrary.vue' : undefined,
  'resources/js/Pages/Panel/PanelSettings.vue' : undefined,
  'resources/js/Pages/Panel/PanelSlider.vue' : undefined,
  'resources/js/Pages/Panel/PanelSliders.vue' : undefined,
  'resources/js/Parts/SliderItemFormInline.vue' : undefined,
  'storage/app/generated-icons.scss' : undefined,
  'routes/web.php' : undefined,
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
    console.info(`Act: copy stub from 'stubs/${stubName}.stub' to '${file}'`);
  }else{
    writeFileOrAct('./'+file, fs.readFileSync(path.resolve(__dirname, `stubs/${stubName}.stub`)));
  }
}


let userModel = fs.readFileSync('./app/Models/User.php').toString();
userModel = userModel.replace(' as Authenticatable;', ' as Authenticatable;\nuse Arg\\Laravel\\Contracts\\IUser;');
if(userModel.includes('implements')){
  userModel = userModel.replace('implements', 'implements IUser, ');
}else{
  const lines = userModel.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if(lines[i].startsWith('class User extends')){
      lines[i] += ' implements IUser';
      break;
    }
  }
  userModel = lines.join('\n');
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
bootstrap = bootstrap.replace(
    '->withExceptions(function (Exceptions $exceptions) {',
    '->withExceptions(fn ($e) => Arg::withExceptionFn($e))->create();'
);
bootstrap = bootstrap.replace('})->create();', '');
writeFileOrAct('./bootstrap/app.php', bootstrap);

let filesystems = fs.readFileSync('config/filesystems.php').toString();
filesystems = filesystems.replace("'public' => [", `'public-folder' => [
            'driver' => 'local',
            'root' => public_path(),
        ],
        'public' => [`)
writeFileOrAct('config/filesystems.php', filesystems);


mkdirOrAct('./resources/svg', { recursive: true });
execOrAct('php artisan arg:trs');
execOrAct('php artisan migrate:fresh --seed');