import { useMSAuth } from '~/composables/useMSAuth'

export default defineNuxtPlugin(async () => {
  const msAuth = useMSAuth()
  await msAuth.initialize()

  return {}
})
