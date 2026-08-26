import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    databaseUrl: '',
    databaseAuthToken: '',
    tmdbApiKey: '',
    omdbApiKey: '',
    inviteCode: '',
    sessionSecret: '',
  },
  app: {
    head: {
      title: 'BingeWatcher',
      titleTemplate: '%s · BingeWatcher',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'A personal movie and series library — discover titles, build lists, rate what you watch, and keep notes in one quiet place.' },
        { name: 'theme-color', content: '#f5f5f3' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;600&family=Syne:wght@500;600&display=swap',
        },
      ],
    },
  },
  nitro: {
    routeRules: {
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    },
  },
})