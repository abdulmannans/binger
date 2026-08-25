<script setup lang="ts">
import type { ListSummary } from '#shared/types'
import { posterUrl } from '#shared/utils/media'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Lists' })

const { data, refresh, pending } = await useFetch<{ lists: ListSummary[] }>('/api/lists')
const lists = computed(() => data.value?.lists ?? [])

const showCreate = ref(false)
const name = ref('')
const description = ref('')
const saving = ref(false)
const error = ref('')

async function createList() {
  if (!name.value.trim()) return
  saving.value = true
  error.value = ''
  try {
    const created = await $fetch<{ list: ListSummary }>('/api/lists', {
      method: 'POST',
      body: { name: name.value, description: description.value },
    })
    showCreate.value = false
    name.value = ''
    description.value = ''
    await refresh()
    await navigateTo(`/lists/${created.list.id}`)
  }
  catch (e) {
    error.value = apiError(e)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm text-mist">Collections</p>
        <h1 class="mt-1 font-display text-4xl font-medium tracking-tight sm:text-5xl">Your lists</h1>
      </div>
      <button
        type="button"
        class="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-panel"
        @click="showCreate = true"
      >
        New list
      </button>
    </div>

    <div v-if="pending && !lists.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 3" :key="n" class="h-44 animate-pulse rounded-lg bg-panel-2" />
    </div>

    <EmptyState
      v-else-if="!lists.length"
      title="No lists yet"
      body="Make a list for comfort rewatches, weekend binges, or whatever you are chasing next."
    >
      <button type="button" class="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-panel" @click="showCreate = true">
        Create your first list
      </button>
    </EmptyState>

    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="list in lists"
        :key="list.id"
        :to="`/lists/${list.id}`"
        class="group overflow-hidden rounded-lg border border-line bg-panel transition hover:-translate-y-0.5 hover:border-ink/20"
      >
        <div class="grid h-36 grid-cols-4 bg-panel-2">
          <div v-for="(poster, i) in [...list.posters, ...Array(4)].slice(0, 4)" :key="i" class="relative overflow-hidden">
            <img
              v-if="poster"
              :src="posterUrl(poster, 'w342') ?? undefined"
              alt=""
              class="h-full w-full object-cover opacity-95 transition group-hover:opacity-100"
            >
            <div v-else class="h-full w-full bg-panel-2" />
          </div>
        </div>
        <div class="p-4">
          <h2 class="font-display text-lg font-medium tracking-tight">{{ list.name }}</h2>
          <p class="mt-1 line-clamp-2 text-sm text-mist">{{ list.description || 'No description' }}</p>
          <p class="mt-3 text-xs text-accent">{{ list.itemCount }} title{{ list.itemCount === 1 ? '' : 's' }}</p>
        </div>
      </NuxtLink>
    </div>

    <div
      v-if="showCreate"
      class="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
      @click.self="showCreate = false"
    >
      <form class="w-full max-w-md rounded-xl border border-line bg-panel p-6 shadow-lg" @submit.prevent="createList">
        <h2 class="font-display text-2xl font-medium tracking-tight">New list</h2>
        <label class="mt-5 block text-sm text-mist">Name</label>
        <input
          v-model="name"
          required
          class="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 outline-none ring-accent/30 focus:ring-2"
          placeholder="Comfort rewatches"
        >
        <label class="mt-4 block text-sm text-mist">Description</label>
        <textarea
          v-model="description"
          rows="3"
          class="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 outline-none ring-accent/30 focus:ring-2"
          placeholder="Optional notes about this list"
        />
        <p v-if="error" class="mt-3 text-sm text-flare">{{ error }}</p>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="rounded-lg px-4 py-2 text-sm text-mist" @click="showCreate = false">Cancel</button>
          <button type="submit" class="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-panel" :disabled="saving">
            {{ saving ? 'Saving…' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
