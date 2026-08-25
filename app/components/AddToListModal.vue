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
const membershipListIds = ref<Set<string>>(new Set())
const loading = ref(true)
const saving = ref(false)
const creating = ref(false)
const error = ref('')
const newName = ref('')
const selectedId = ref('')

const availableLists = computed(() => lists.value.filter(list => !membershipListIds.value.has(list.id)))

onMounted(async () => {
  try {
    const [listsData, membership] = await Promise.all([
      $fetch<{ lists: ListSummary[] }>('/api/lists'),
      $fetch<{ items: { listId: string }[] }>('/api/library/title', {
        query: { tmdbId: props.tmdbId, mediaType: props.mediaType },
      }),
    ])
    lists.value = listsData.lists
    membershipListIds.value = new Set(membership.items.map(item => item.listId))
    selectedId.value = availableLists.value[0]?.id ?? ''
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
  if (membershipListIds.value.has(selectedId.value)) {
    error.value = 'Already on this list'
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
          class="flex items-center gap-3 rounded-xl border px-3 py-2 transition"
          :class="[
            membershipListIds.has(list.id)
              ? 'cursor-not-allowed border-line/60 opacity-60'
              : selectedId === list.id
                ? 'cursor-pointer border-gold bg-gold/10'
                : 'cursor-pointer border-line hover:border-mist',
          ]"
        >
          <input
            v-model="selectedId"
            type="radio"
            :value="list.id"
            class="accent-gold"
            :disabled="membershipListIds.has(list.id)"
          >
          <span class="flex-1">
            <span class="block text-sm font-medium">{{ list.name }}</span>
            <span class="text-xs text-mist">
              <template v-if="membershipListIds.has(list.id)">Already added</template>
              <template v-else>{{ list.itemCount }} title{{ list.itemCount === 1 ? '' : 's' }}</template>
            </span>
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
        :disabled="saving || loading || !selectedId || membershipListIds.has(selectedId)"
        @click="addToList"
      >
        {{ saving ? 'Adding…' : availableLists.length ? 'Add to list' : 'Already on all lists' }}
      </button>
    </div>
  </div>
</template>
