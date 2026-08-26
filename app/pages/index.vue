<script setup lang="ts">
definePageMeta({ layout: 'marketing' })

const { user, ready, fetchUser } = useAuth()

if (!ready.value) await fetchUser()
if (user.value) {
  await navigateTo('/discover')
}

useHead({
  title: 'BingeWatcher',
  titleTemplate: null,
  meta: [
    {
      name: 'description',
      content: 'A personal movie and series library — discover titles, build lists, rate what you watch, and keep notes in one quiet place.',
    },
  ],
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden">
      <div class="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
        <p class="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          BingeWatcher
        </p>
        <h1 class="mt-6 max-w-2xl font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
          Your personal movie and series library
        </h1>
        <p class="mt-5 max-w-lg text-base text-mist sm:text-lg">
          Discover titles, pin them to lists, rate what you finish, and leave notes — a quiet shelf for what you want next.
        </p>
        <div class="mt-10 flex flex-wrap items-center gap-4">
          <NuxtLink
            to="/register"
            class="rounded-lg bg-ink px-5 py-3 text-sm font-medium text-panel transition hover:bg-ink-2"
          >
            Get started
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="rounded-lg border border-line px-5 py-3 text-sm font-medium text-ink transition hover:border-ink/30"
          >
            Sign in
          </NuxtLink>
        </div>
      </div>

      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-canvas to-transparent"
        aria-hidden="true"
      />
      <div
        class="mx-auto flex max-w-6xl gap-3 overflow-hidden px-4 pb-16 opacity-40 sm:gap-4 sm:px-6"
        aria-hidden="true"
      >
        <div
          v-for="n in 8"
          :key="n"
          class="h-36 w-24 shrink-0 rounded-lg bg-panel-2 sm:h-44 sm:w-28"
          :style="{ transform: `translateY(${(n % 3) * 8}px)` }"
        />
      </div>
    </section>

    <section class="border-t border-line">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 class="font-display text-2xl font-medium tracking-tight">How it works</h2>
        <p class="mt-2 max-w-xl text-mist">
          Three steps from browsing to a library that feels like yours.
        </p>
        <ol class="mt-10 grid gap-10 sm:grid-cols-3">
          <li>
            <p class="text-sm font-medium text-accent">01</p>
            <h3 class="mt-2 font-display text-lg font-medium">Discover</h3>
            <p class="mt-2 text-sm leading-relaxed text-mist">
              Browse trending movies, series, and anime, or search for something specific.
            </p>
          </li>
          <li>
            <p class="text-sm font-medium text-accent">02</p>
            <h3 class="mt-2 font-display text-lg font-medium">List it</h3>
            <p class="mt-2 text-sm leading-relaxed text-mist">
              Save titles to lists and mark them want, watching, or watched.
            </p>
          </li>
          <li>
            <p class="text-sm font-medium text-accent">03</p>
            <h3 class="mt-2 font-display text-lg font-medium">Rate & note</h3>
            <p class="mt-2 text-sm leading-relaxed text-mist">
              Leave a rating and a short note so future-you remembers why it mattered.
            </p>
          </li>
        </ol>
      </div>
    </section>

    <section class="border-t border-line bg-panel/40">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 class="font-display text-2xl font-medium tracking-tight">What you get</h2>
        <p class="mt-2 max-w-xl text-mist">
          Built for people who track what they watch — not a cinema marquee.
        </p>
        <ul class="mt-10 max-w-2xl space-y-4 text-sm leading-relaxed text-mist">
          <li class="border-l-2 border-accent/40 pl-4">
            A private library of movies and series with posters and ratings from TMDB and OMDb.
          </li>
          <li class="border-l-2 border-accent/40 pl-4">
            Custom lists, watch status, personal ratings, and notes that stay with your account.
          </li>
          <li class="border-l-2 border-accent/40 pl-4">
            Invite-only sign-up — your shelf stays yours.
          </li>
        </ul>
      </div>
    </section>

    <footer class="border-t border-line">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
        <p class="font-display text-sm font-semibold tracking-tight text-ink">BingeWatcher</p>
        <NuxtLink to="/login" class="text-sm text-mist transition hover:text-ink">
          Sign in
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>
