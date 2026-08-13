import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || 'file:data/bingewatcher.db',
    databaseAuthToken: process.env.DATABASE_AUTH_TOKEN || '',
    tmdbApiKey: process.env.TMDB_API_KEY || '',
    omdbApiKey: process.env.OMDB_API_KEY || '',
    inviteCode: process.env.INVITE_CODE || '',
    sessionSecret: process.env.SESSION_SECRET || '',
  },
  app: {
    head: {
      title: 'BingeWatcher',
      titleTemplate: '%s · BingeWatcher',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Your personal movie and series library' },
        { name: 'theme-color', content: '#0b0b0f' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },
})
