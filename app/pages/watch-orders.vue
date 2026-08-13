<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Watch orders' })

interface WatchOrderSummary {
  slug: string
  name: string
  tag: string
  description: string
  source?: string
  count: number
}

const { data, error: fetchError } = await useFetch<{ orders: WatchOrderSummary[] }>('/api/watch-orders', {
  default: () => ({ orders: [] }),
})
const orders = computed(() => data.value?.orders ?? [])

const installing = ref('')
const progress = ref('')
const error = ref('')

async function install(order: WatchOrderSummary) {
  installing.value = order.slug
  error.value = ''
  progress.value = `Starting ${order.name}…`
  let listId = ''
  let offset = 0
  let added = 0
  const skipped: { title: string, year: number }[] = []

  try {
    while (true) {
      const chunk = await $fetch<{
        listId: string
        added: number
        skipped: { title: string, year: number }[]
        nextOffset: number
        total: number
        done: boolean
      }>(`/api/watch-orders/${order.slug}`, {
        method: 'POST',
        body: { listId: listId || undefined, offset },
      })
      listId = chunk.listId
      added += chunk.added
      skipped.push(...chunk.skipped)
      offset = chunk.nextOffset
      progress.value = `Matched ${Math.min(offset, chunk.total)} of ${chunk.total}…`
      if (chunk.done) break
    }

    if (skipped.length) {
      await navigateTo({
        path: `/lists/${listId}`,
        query: { missed: skipped.map(item => `${item.title} (${item.year})`).join(', ') },
      })
      return
    }
    await navigateTo(`/lists/${listId}`)
  }
  catch (e) {
    error.value = apiError(e)
  }
  finally {
    installing.value = ''
    progress.value = ''
  }
}
</script>

<template>
  <div>
    <p class="text-xs uppercase tracking-[0.25em] text-gold">Curated</p>
    <h1 class="font-display text-6xl">Watch orders</h1>
    <p class="mt-2 max-w-2xl text-mist">
      Install a chronological list in one tap. Titles are matched on TMDB and added in release order so you can binge them in sequence.
    </p>
    <p v-if="error || fetchError" class="mt-4 text-sm text-flare">{{ error || apiError(fetchError) }}</p>
    <p v-if="progress" class="mt-4 text-sm text-gold">{{ progress }}</p>

    <div class="mt-8 grid gap-4 lg:grid-cols-2">
      <article
        v-for="order in orders"
        :key="order.slug"
        class="rounded-2xl border border-line bg-panel p-5"
      >
        <p class="text-xs uppercase tracking-wider text-gold">{{ order.tag }}</p>
        <h2 class="mt-1 font-display text-3xl">{{ order.name }}</h2>
        <p class="mt-2 text-sm text-mist">{{ order.description }}</p>
        <p class="mt-3 text-xs uppercase tracking-wider text-mist">{{ order.count }} titles</p>
        <div class="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink disabled:opacity-60"
            :disabled="Boolean(installing)"
            @click="install(order)"
          >
            {{ installing === order.slug ? 'Installing…' : 'Add as a list' }}
          </button>
          <a
            v-if="order.source"
            :href="order.source"
            target="_blank"
            rel="noreferrer"
            class="text-sm text-mist hover:text-gold"
          >
            Source
          </a>
        </div>
      </article>
    </div>
  </div>
</template>
