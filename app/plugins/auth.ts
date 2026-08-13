export default defineNuxtPlugin(async () => {
  const { fetchUser, ready } = useAuth()
  if (!ready.value) await fetchUser()
})
