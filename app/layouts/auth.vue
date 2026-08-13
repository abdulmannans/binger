<template>
  <div class="relative min-h-screen overflow-hidden bg-ink text-paper">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-24 top-0 h-80 w-80 rounded-full bg-flare/20 blur-3xl" />
      <div class="absolute right-0 top-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent,_#0b0b0f_70%)]" />
    </div>
    <div class="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <NuxtLink to="/" class="mb-10 text-center">
        <p class="font-display text-5xl text-gold">BingeWatcher</p>
        <p class="mt-1 text-sm tracking-wide text-mist">Your private screening room</p>
      </NuxtLink>
      <slot />
    </div>
  </div>
</template>
