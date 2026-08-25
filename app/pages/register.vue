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
  <form class="w-full max-w-sm border-y border-line py-8 sm:border sm:rounded-xl sm:border-line sm:bg-panel sm:px-6 sm:py-8" @submit.prevent="submit">
    <h1 class="font-display text-3xl font-medium tracking-tight">Join the library</h1>
    <p class="mt-2 text-sm text-mist">Invite code required. Passwords are stored as hashes.</p>

    <label class="mt-6 block text-sm text-mist">Display name</label>
    <input
      v-model="displayName"
      type="text"
      required
      minlength="2"
      autocomplete="nickname"
      class="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 outline-none ring-accent/30 focus:ring-2"
    >

    <label class="mt-4 block text-sm text-mist">Email</label>
    <input
      v-model="email"
      type="email"
      required
      autocomplete="email"
      class="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 outline-none ring-accent/30 focus:ring-2"
    >

    <label class="mt-4 block text-sm text-mist">Password</label>
    <input
      v-model="password"
      type="password"
      required
      minlength="8"
      autocomplete="new-password"
      class="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 outline-none ring-accent/30 focus:ring-2"
    >

    <label class="mt-4 block text-sm text-mist">Invite code</label>
    <input
      v-model="inviteCode"
      type="text"
      required
      class="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 outline-none ring-accent/30 focus:ring-2"
    >

    <p v-if="error" class="mt-4 text-sm text-flare">{{ error }}</p>

    <button
      type="submit"
      class="mt-6 w-full rounded-lg bg-ink py-2.5 font-medium text-panel disabled:opacity-50"
      :disabled="loading"
    >
      {{ loading ? 'Creating…' : 'Create account' }}
    </button>

    <p class="mt-5 text-center text-sm text-mist">
      Already have an account?
      <NuxtLink to="/login" class="text-accent hover:underline">Sign in</NuxtLink>
    </p>
  </form>
</template>
