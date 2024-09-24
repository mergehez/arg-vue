# Arg-Vue

## Steps

### 1. Add `arg-vue` to `package.json`

```
    "arg-vue": "file:../arg-vue",
```

### 2. Add `arg-laravel` to `composer.json`

```
...
"repositories": [
    {
        "type": "path",
        "url": "../arg-laravel"
    }
],
"require": {
    "arg/laravel": "*",
...

```

### 3. Run following commands

```bash
bun install -D tailwindcss postcss autoprefixer sass typescript @iconify/tailwind @iconify-icons/mdi @iconify-icons/ic @iconify-icons/fluent @iconify-icons/fa6-solid vue @vitejs/plugin-vue

bun install dayjs pinia @vueuse/core @vueuse/components tailwind-merge latinize @formkit/auto-animate @inertiajs/vue3

bunx tailwindcss init -p

composer require inertiajs/inertia-laravel ralphjsmit/laravel-seo tightenco/ziggy

composer require -D barryvdh/laravel-debugbar
```


### 4. `tailwind.config.js`

```js
import defaultTheme from 'tailwindcss/defaultTheme';
import {addDynamicIconSelectors} from "@iconify/tailwind";


/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './storage/framework/views/*.php',
        './resources/views/app.blade.php',
        './resources/js/**/*.{vue,js,ts}',
        './node_modules/arg-vue/lib/**/*.{vue,js,ts}',
    ],

    theme: {
        extend: {
            colors: {
                'x0': 'rgb(var(--bg0) / <alpha-value>)',
                'x1': 'rgb(var(--bg1) / <alpha-value>)',
                'x2': 'rgb(var(--bg2) / <alpha-value>)',
                'x3': 'rgb(var(--bg3) / <alpha-value>)',
                'x4': 'rgb(var(--bg4) / <alpha-value>)',
                'x5': 'rgb(var(--bg5) / <alpha-value>)',
                'x6': 'rgb(var(--bg6) / <alpha-value>)',
                'x7': 'rgb(var(--bg7) / <alpha-value>)',
                'x8': 'rgb(var(--bg8) / <alpha-value>)',
                'reverse': 'rgb(var(--bg-reverse) / <alpha-value>)',
                'surface0': 'rgb(var(--clr-default) / <alpha-value>)',
            },
        },
        screens: {
            'xs': '475px',
            'laptop': '992px',
            ...defaultTheme.screens,
        },
    },
    darkMode: 'class',
    plugins: [
        addDynamicIconSelectors(),
    ],
};

```