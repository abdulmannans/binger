<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Create account' })

const { register } = useAuth()
const displayName = ref('')
const email = ref('')
const password = ref('')
const inviteCode = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await register({
      email: email.value,
      password: password.value,
      displayName: displayName.value,
      inviteCode: inviteCode.value,
    })
    await navigateTo('/')
  }
  catch (e) {
    error.value = apiError(e)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="w-full max-w-sm rounded-2xl border border-line bg-panel/90 p-6 shadow-2xl" @submit.prevent="submit">
    <h1 class="font-display text-4xl">Join the library</h1>
    <p class="mt-1 text-sm text-mist">Invite code required. Passwords are stored as hashes, not plain text.</p>

    <label class="mt-6 block text-xs uppercase tracking-wider text-mist">Display name</label>
    <input
      v-model="displayName"
      type="text"
      required
      minlength="2"
      autocomplete="nickname"
      class="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2.5 outline-none ring-gold/40 focus:ring-2"
    >

    <label class="mt-4 block text-xs uppercase tracking-wider text-mist">Email</label>
    <input
      v-model="email"
      type="email"
      required
      autocomplete="email"
      class="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2.5 outline-none ring-gold/40 focus:ring-2"
    >

    <label class="mt-4 block text-xs uppercase tracking-wider text-mist">Password</label>
    <input
      v-model="password"
      type="password"
      required
      minlength="8"
      autocomplete="new-password"
      class="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2.5 outline-none ring-gold/40 focus:ring-2"
    >

    <label class="mt-4 block text-xs uppercase tracking-wider text-mist">Invite code</label>
    <input
      v-model="inviteCode"
      type="text"
      required
      class="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2.5 outline-none ring-gold/40 focus:ring-2"
    >

    <p v-if="error" class="mt-4 text-sm text-flare">{{ error }}</p>

    <button
      type="submit"
      class="mt-6 w-full rounded-xl bg-gold py-2.5 font-semibold text-ink disabled:opacity-50"
      :disabled="loading"
    >
      {{ loading ? 'Creating…' : 'Create account' }}
    </button>

    <p class="mt-4 text-center text-sm text-mist">
      Already have a seat?
      <NuxtLink to="/login" class="text-gold hover:underline">Sign in</NuxtLink>
    </p>
  </form>
</template>
