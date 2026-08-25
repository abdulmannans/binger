<template>
  <div class="relative min-h-screen overflow-hidden text-ink">
    <div class="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <NuxtLink to="/" class="mb-12 text-center">
        <p class="font-display text-2xl font-semibold tracking-tight text-ink">BingeWatcher</p>
        <p class="mt-2 text-sm text-mist">Your personal library</p>
      </NuxtLink>
      <slot />
    </div>
  </div>
</template>
