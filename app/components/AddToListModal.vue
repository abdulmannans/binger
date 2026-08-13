<script setup lang="ts">
import type { ListSummary, MediaType } from '#shared/types'

const props = defineProps<{
  tmdbId: number
  mediaType: MediaType
  title: string
}>()

const emit = defineEmits<{
  close: []
  added: [listId: string]
}>()

const lists = ref<ListSummary[]>([])
const loading = ref(true)
const saving = ref(false)
const creating = ref(false)
const error = ref('')
const newName = ref('')
const selectedId = ref('')

onMounted(async () => {
  try {
    const data = await $fetch<{ lists: ListSummary[] }>('/api/lists')
    lists.value = data.lists
    selectedId.value = data.lists[0]?.id ?? ''
  }
  catch (e) {
    error.value = apiError(e)
  }
  finally {
    loading.value = false
  }
})

async function createList() {
  const name = newName.value.trim()
  if (!name) return
  creating.value = true
  error.value = ''
  try {
    const data = await $fetch<{ list: ListSummary }>('/api/lists', {
      method: 'POST',
      body: { name },
    })
    lists.value.unshift(data.list)
    selectedId.value = data.list.id
    newName.value = ''
  }
  catch (e) {
    error.value = apiError(e)
  }
  finally {
    creating.value = false
  }
}

async function addToList() {
  if (!selectedId.value) {
    error.value = 'Create a list first'
    return
  }
  saving.value = true
  error.value = ''
  try {
    await $fetch(`/api/lists/${selectedId.value}/items`, {
      method: 'POST',
      body: { tmdbId: props.tmdbId, mediaType: props.mediaType },
    })
    emit('added', selectedId.value)
    emit('close')
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
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" @click.self="emit('close')">
    <div class="w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl">
      <div class="mb-4 flex items-start justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-widest text-gold">Add to list</p>
          <h2 class="mt-1 text-lg font-semibold">{{ title }}</h2>
        </div>
        <button type="button" class="text-mist hover:text-paper" @click="emit('close')">✕</button>
      </div>

      <p v-if="loading" class="text-sm text-mist">Loading lists…</p>
      <p v-else-if="!lists.length" class="text-sm text-mist">No lists yet. Create one below.</p>

      <div v-else class="mb-4 max-h-56 space-y-2 overflow-y-auto">
        <label
          v-for="list in lists"
          :key="list.id"
          class="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition"
          :class="selectedId === list.id ? 'border-gold bg-gold/10' : 'border-line hover:border-mist'"
        >
          <input v-model="selectedId" type="radio" :value="list.id" class="accent-gold">
          <span class="flex-1">
            <span class="block text-sm font-medium">{{ list.name }}</span>
            <span class="text-xs text-mist">{{ list.itemCount }} title{{ list.itemCount === 1 ? '' : 's' }}</span>
          </span>
        </label>
      </div>

      <form class="mb-4 flex gap-2" @submit.prevent="createList">
        <input
          v-model="newName"
          type="text"
          placeholder="New list name"
          class="flex-1 rounded-xl border border-line bg-ink px-3 py-2 text-sm outline-none ring-gold/40 placeholder:text-mist/70 focus:ring-2"
        >
        <button
          type="submit"
          class="rounded-xl bg-panel-2 px-3 py-2 text-sm text-paper disabled:opacity-50"
          :disabled="creating || !newName.trim()"
        >
          Create
        </button>
      </form>

      <p v-if="error" class="mb-3 text-sm text-flare">{{ error }}</p>

      <button
        type="button"
        class="w-full rounded-xl bg-gold py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
        :disabled="saving || loading"
        @click="addToList"
      >
        {{ saving ? 'Adding…' : 'Add to list' }}
      </button>
    </div>
  </div>
</template>
