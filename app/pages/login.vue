<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Sign in' })

const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
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
    <h1 class="font-display text-3xl font-medium tracking-tight">Sign in</h1>
    <p class="mt-2 text-sm text-mist">Email and password for your library.</p>

    <label class="mt-6 block text-sm text-mist">Email</label>
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
      autocomplete="current-password"
      class="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 outline-none ring-accent/30 focus:ring-2"
    >

    <p v-if="error" class="mt-4 text-sm text-flare">{{ error }}</p>

    <button
      type="submit"
      class="mt-6 w-full rounded-lg bg-ink py-2.5 font-medium text-panel disabled:opacity-50"
      :disabled="loading"
    >
      {{ loading ? 'Signing in…' : 'Sign in' }}
    </button>

    <p class="mt-5 text-center text-sm text-mist">
      New here?
      <NuxtLink to="/register" class="text-accent hover:underline">Create an account</NuxtLink>
    </p>
  </form>
</template>
