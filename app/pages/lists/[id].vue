<script setup lang="ts">
import type { ListDetail } from '#shared/types'
import { STATUS_LABELS } from '#shared/utils/media'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const id = computed(() => String(route.params.id))

const { data, refresh, error: fetchError } = await useFetch<{ list: ListDetail }>(() => `/api/lists/${id.value}`)
const list = computed(() => data.value?.list)

useHead({ title: () => list.value?.name || 'List' })

const editing = ref(false)
const name = ref('')
const description = ref('')
const saving = ref(false)
const deleting = ref(false)
const error = ref('')

watch(list, (value) => {
  if (value && !editing.value) {
    name.value = value.name
    description.value = value.description
  }
}, { immediate: true })

async function saveMeta() {
  saving.value = true
  error.value = ''
  try {
    await $fetch(`/api/lists/${id.value}`, {
      method: 'PATCH',
      body: { name: name.value, description: description.value },
    })
    editing.value = false
    await refresh()
  }
  catch (e) {
    error.value = apiError(e)
  }
  finally {
    saving.value = false
  }
}

async function removeList() {
  if (!confirm('Delete this list and every title on it?')) return
  deleting.value = true
  try {
    await $fetch(`/api/lists/${id.value}`, { method: 'DELETE' })
    await navigateTo('/lists')
  }
  catch (e) {
    error.value = apiError(e)
    deleting.value = false
  }
}

async function removeItem(itemId: string) {
  if (!confirm('Remove this title from the list?')) return
  await $fetch(`/api/items/${itemId}`, { method: 'DELETE' })
  await refresh()
}

async function moveItem(index: number, direction: -1 | 1) {
  if (!list.value) return
  const next = index + direction
  if (next < 0 || next >= list.value.items.length) return
  const ids = list.value.items.map(item => item.id)
  const moved = ids[index]
  if (!moved) return
  ids.splice(index, 1)
  ids.splice(next, 0, moved)
  await $fetch(`/api/lists/${id.value}/reorder`, {
    method: 'POST',
    body: { ids },
  })
  await refresh()
}
</script>

<template>
  <div v-if="list">
    <NuxtLink to="/lists" class="text-sm text-mist hover:text-gold">← All lists</NuxtLink>

    <div class="mt-4 flex flex-wrap items-start justify-between gap-4">
      <div class="flex-1">
        <template v-if="!editing">
          <h1 class="font-display text-6xl">{{ list.name }}</h1>
          <p class="mt-2 max-w-2xl text-mist">{{ list.description || 'No description yet.' }}</p>
        </template>
        <form v-else class="max-w-xl space-y-3" @submit.prevent="saveMeta">
          <input v-model="name" required class="w-full rounded-xl border border-line bg-panel px-3 py-2 outline-none ring-gold/40 focus:ring-2">
          <textarea v-model="description" rows="3" class="w-full rounded-xl border border-line bg-panel px-3 py-2 outline-none ring-gold/40 focus:ring-2" />
          <div class="flex gap-2">
            <button type="submit" class="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink" :disabled="saving">Save</button>
            <button type="button" class="rounded-xl px-4 py-2 text-sm text-mist" @click="editing = false">Cancel</button>
          </div>
        </form>
        <p class="mt-3 text-sm text-mist">{{ list.items.length }} title{{ list.items.length === 1 ? '' : 's' }} · numbered watch order</p>
      </div>
      <div class="flex gap-2">
        <button type="button" class="rounded-full border border-line px-4 py-2 text-sm" @click="editing = true">Rename</button>
        <button type="button" class="rounded-full border border-flare/40 px-4 py-2 text-sm text-flare" :disabled="deleting" @click="removeList">
          Delete
        </button>
      </div>
    </div>
    <p v-if="error" class="mt-3 text-sm text-flare">{{ error }}</p>
    <p v-if="route.query.missed" class="mt-3 text-sm text-mist">
      Installed with a few unmatched titles: {{ route.query.missed }}
    </p>

    <EmptyState
      v-if="!list.items.length"
      class="mt-10"
      title="This list is empty"
      body="Head to Discover and tap + on a poster, or open a title and add it here."
    >
      <NuxtLink to="/" class="rounded-full bg-gold px-5 py-2 font-semibold text-ink">Find something to add</NuxtLink>
    </EmptyState>

    <div v-else class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      <div v-for="(item, index) in list.items" :key="item.id" class="space-y-2">
        <PosterCard
          compact
          :order="index + 1"
          :tmdb-id="item.tmdbId"
          :media-type="item.mediaType"
          :title="item.title"
          :year="item.year"
          :poster-path="item.posterPath"
          :imdb-rating="item.imdbRating"
          :user-rating="item.userRating"
        />
        <p class="text-xs text-mist">
          <span v-if="item.status">{{ STATUS_LABELS[item.status] }}</span>
          <span v-if="item.notes" class="line-clamp-2">{{ item.notes }}</span>
        </p>
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            class="text-mist hover:text-gold disabled:opacity-30"
            :disabled="index === 0"
            @click="moveItem(index, -1)"
          >
            Up
          </button>
          <button
            type="button"
            class="text-mist hover:text-gold disabled:opacity-30"
            :disabled="index === list.items.length - 1"
            @click="moveItem(index, 1)"
          >
            Down
          </button>
          <button type="button" class="text-flare hover:underline" @click="removeItem(item.id)">Remove</button>
        </div>
      </div>
    </div>
  </div>
  <EmptyState v-else-if="fetchError" title="List not found" body="It may have been deleted, or it belongs to another account.">
    <NuxtLink to="/lists" class="text-gold hover:underline">Back to lists</NuxtLink>
  </EmptyState>
</template>
