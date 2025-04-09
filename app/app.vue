<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#111827' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'DPSCD Application Schools Management Platform'
const description = 'An application for DPSCD administrators to manage placements and waitlists for students applying to K8 exam and Montessori schools.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  //ogImage: 'https://dashboard-template.nuxt.dev/social-card.png',
  //twitterImage: 'https://dashboard-template.nuxt.dev/social-card.png',
  //twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
