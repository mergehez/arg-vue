<script setup lang="ts">

import {Head} from "@inertiajs/vue3";

defineProps<{
    title?: string,
    description?: string,
    image?: string,
}>();

</script>

<template>
    <Head>
        <template v-if="title">
            <title>{{ title }}</title>
            <meta head-key="a" name="title" :content="title" />
            <meta head-key="b" property="og:title" :content="title" />
            <meta head-key="c" name="twitter:title" :content="title" />
            <meta head-key="d" name="apple-mobile-web-app-title" :content="title" />
            <meta head-key="e" name="og:image:alt" :content="title" />
        </template>

        <template v-if="description">
            <meta head-key="f" name="description" :content="description" />
            <meta head-key="g" property="og:description" :content="description" />
            <meta head-key="h" name="twitter:description" :content="description" />
            <meta head-key="i" name="abstract" :content="description" />
        </template>

        <template v-if="image">
            <meta property="og:image" :content="image" />
            <meta name="twitter:image" :content="image" />
        </template>
    </Head>
</template>