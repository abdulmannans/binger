<script setup lang="ts">
import { posterUrl } from '#shared/utils/media'

definePageMeta({ layout: 'marketing' })

const INVITE_EMAIL = 'samannan1999@gmail.com'
const inviteMailto = `mailto:${INVITE_EMAIL}?subject=${encodeURIComponent('BingeWatcher invite request')}`

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

const { data: spotlight } = await useFetch<{ posters: { title: string, posterPath: string }[] }>('/api/landing/spotlight', {
  default: () => ({ posters: [] }),
})

const posters = computed(() => spotlight.value?.posters ?? [])

const demoSteps = [
  {
    id: 'discover',
    label: 'Discover',
    title: 'Browse what is trending',
    body: 'Search or filter movies, series, and anime, then open a title for details.',
  },
  {
    id: 'list',
    label: 'Lists',
    title: 'Pin titles to your shelf',
    body: 'Add anything to a list and mark it want, watching, or watched.',
  },
  {
    id: 'rate',
    label: 'Rate',
    title: 'Leave a rating and a note',
    body: 'Stars and a short note so you remember why it stuck with you.',
  },
] as const

const demoIndex = ref(0)
const currentDemo = computed(() => demoSteps[demoIndex.value] ?? demoSteps[0])
let demoTimer: ReturnType<typeof setInterval> | null = null

function setDemo(index: number) {
  demoIndex.value = index
}

onMounted(() => {
  demoTimer = setInterval(() => {
    demoIndex.value = (demoIndex.value + 1) % demoSteps.length
  }, 4500)
})

onBeforeUnmount(() => {
  if (demoTimer) clearInterval(demoTimer)
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden">
      <div class="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-24">
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
        class="pointer-events-none relative mx-auto max-w-6xl px-4 sm:px-6"
        aria-hidden="true"
      >
        <div class="flex gap-3 overflow-hidden pb-16 sm:gap-4">
          <img
            v-for="(poster, n) in posters"
            :key="poster.posterPath"
            :src="posterUrl(poster.posterPath, 'w342')!"
            :alt="poster.title"
            class="h-44 w-28 shrink-0 rounded-lg object-cover shadow-sm transition duration-500 sm:h-52 sm:w-32"
            :style="{ transform: `translateY(${(n % 3) * 10}px)` }"
            loading="lazy"
            decoding="async"
          >
          <template v-if="!posters.length">
            <div
              v-for="n in 8"
              :key="n"
              class="h-44 w-28 shrink-0 animate-pulse rounded-lg bg-panel-2 sm:h-52 sm:w-32"
              :style="{ transform: `translateY(${(n % 3) * 10}px)` }"
            />
          </template>
        </div>
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-canvas to-transparent" />
      </div>
    </section>

    <section class="border-t border-line">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 class="font-display text-2xl font-medium tracking-tight">See it in action</h2>
        <p class="mt-2 max-w-xl text-mist">
          A quick walkthrough of Discover, lists, and ratings — no account needed to peek.
        </p>

        <div class="mt-8 flex flex-wrap gap-2">
          <button
            v-for="(step, index) in demoSteps"
            :key="step.id"
            type="button"
            class="rounded-lg border px-3.5 py-2 text-sm transition"
            :class="demoIndex === index
              ? 'border-ink bg-ink text-panel'
              : 'border-line text-mist hover:border-ink/30 hover:text-ink'"
            @click="setDemo(index)"
          >
            {{ step.label }}
          </button>
        </div>

        <div class="mt-8 overflow-hidden rounded-xl border border-line bg-panel shadow-sm">
          <div class="flex items-center gap-2 border-b border-line px-4 py-3">
            <span class="size-2.5 rounded-full bg-panel-2" />
            <span class="size-2.5 rounded-full bg-panel-2" />
            <span class="size-2.5 rounded-full bg-panel-2" />
            <p class="ml-3 truncate text-xs text-mist">bingewatcher · {{ currentDemo.label }}</p>
          </div>

          <div class="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
            <div class="border-b border-line p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <p class="text-sm font-medium text-accent">0{{ demoIndex + 1 }}</p>
              <h3 class="mt-2 font-display text-xl font-medium tracking-tight">
                {{ currentDemo.title }}
              </h3>
              <p class="mt-3 text-sm leading-relaxed text-mist">
                {{ currentDemo.body }}
              </p>
            </div>

            <div class="relative min-h-[280px] bg-canvas/80 p-6 sm:p-8">
              <!-- Discover mock -->
              <div
                v-show="demoIndex === 0"
                class="space-y-4 transition duration-300"
              >
                <div class="h-9 max-w-sm rounded-lg border border-line bg-panel px-3 text-xs leading-9 text-mist/70">
                  Search titles — The Bear, Heat…
                </div>
                <div class="flex gap-2.5 overflow-hidden">
                  <div
                    v-for="poster in posters.slice(0, 5)"
                    :key="`demo-d-${poster.posterPath}`"
                    class="w-[72px] shrink-0"
                  >
                    <img
                      :src="posterUrl(poster.posterPath, 'w185')!"
                      :alt="poster.title"
                      class="aspect-[2/3] w-full rounded-md object-cover"
                      loading="lazy"
                    >
                    <p class="mt-1.5 truncate text-[10px] text-mist">{{ poster.title }}</p>
                  </div>
                  <template v-if="posters.length < 5">
                    <div
                      v-for="n in 5 - posters.length"
                      :key="`ph-${n}`"
                      class="aspect-[2/3] w-[72px] shrink-0 rounded-md bg-panel-2"
                    />
                  </template>
                </div>
              </div>

              <!-- Lists mock -->
              <div
                v-show="demoIndex === 1"
                class="space-y-3"
              >
                <div class="rounded-lg border border-line bg-panel px-4 py-3">
                  <p class="text-xs text-mist">Watching</p>
                  <p class="mt-1 text-sm font-medium">Weekend comfort</p>
                  <div class="mt-3 flex -space-x-2">
                    <img
                      v-for="poster in posters.slice(0, 4)"
                      :key="`demo-l-${poster.posterPath}`"
                      :src="posterUrl(poster.posterPath, 'w185')!"
                      :alt="poster.title"
                      class="size-9 rounded border-2 border-panel object-cover"
                      loading="lazy"
                    >
                  </div>
                </div>
                <div class="rounded-lg border border-line bg-panel px-4 py-3 opacity-70">
                  <p class="text-xs text-mist">Want</p>
                  <p class="mt-1 text-sm font-medium">Queue for next month</p>
                </div>
              </div>

              <!-- Rate mock -->
              <div
                v-show="demoIndex === 2"
                class="rounded-lg border border-line bg-panel p-5"
              >
                <div class="flex gap-4">
                  <img
                    v-if="posters[0]"
                    :src="posterUrl(posters[0].posterPath, 'w185')!"
                    :alt="posters[0].title"
                    class="h-28 w-[72px] rounded-md object-cover"
                    loading="lazy"
                  >
                  <div v-else class="h-28 w-[72px] rounded-md bg-panel-2" />
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-display text-base font-medium">
                      {{ posters[0]?.title || 'A title you love' }}
                    </p>
                    <div class="mt-2 flex gap-1 text-accent" aria-hidden="true">
                      <span v-for="s in 5" :key="s" class="text-sm">{{ s <= 4 ? '★' : '☆' }}</span>
                    </div>
                    <p class="mt-3 text-xs leading-relaxed text-mist">
                      Slow burn, perfect for a rainy Sunday. Would rewatch.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

        <div class="mt-12 max-w-xl rounded-xl border border-line bg-panel p-6 sm:p-8">
          <h3 class="font-display text-lg font-medium tracking-tight">Need an invite code?</h3>
          <p class="mt-2 text-sm leading-relaxed text-mist">
            Sign-up is invite-only. Email me and I will send you a code.
          </p>
          <a
            :href="inviteMailto"
            class="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-panel transition hover:bg-ink-2"
          >
            Mail me for an invite
          </a>
          <p class="mt-3 text-sm text-mist">
            <a
              :href="inviteMailto"
              class="text-accent underline-offset-2 hover:underline"
            >{{ INVITE_EMAIL }}</a>
          </p>
        </div>
      </div>
    </section>

    <footer class="border-t border-line">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
        <p class="font-display text-sm font-semibold tracking-tight text-ink">BingeWatcher</p>
        <div class="flex items-center gap-4 text-sm text-mist">
          <a :href="inviteMailto" class="transition hover:text-ink">Request invite</a>
          <NuxtLink to="/login" class="transition hover:text-ink">
            Sign in
          </NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>
