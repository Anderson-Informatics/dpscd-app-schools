// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/ui-pro", "@vueuse/nuxt", "@pinia/nuxt"],
  ssr: false,
  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/api/**": {
      cors: true,
    },
  },

  nitro: {
    plugins: ["~~/server/plugins/mongodb.ts"],
  },

  runtimeConfig: {
    public: {
      clientId: process.env.NUXT_PUBLIC_CLIENTID,
      authority: process.env.NUXT_PUBLIC_AUTHORITY,
      redirectUri: process.env.NUXT_PUBLIC_REDIRECT_URI,
      postLogoutRedirectUri: process.env.NUXT_PUBLIC_POSTLOGOUT_REDIRECT_URI,
    },
    MONGO_URI: process.env.MONGO_URI,
    MONGO_URI_2024: process.env.MONGO_URI_2024,
    API_URL: process.env.API_URL,
    SUBMITTABLE_API_KEY: process.env.SUBMITTABLE_API_KEY,
  },

  future: {
    compatibilityVersion: 4,
  },

  plugins: [{ src: "~/plugins/msal.ts", mode: "client" }],

  compatibilityDate: "2024-07-11",

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
