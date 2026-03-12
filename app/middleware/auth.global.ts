import { useMSAuth } from '~/composables/useMSAuth'
import type { DatabaseUser } from '~/types'
import { useAppUser } from '#imports'

export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (import.meta.server) return
  if (to.name === '/login') return

  const msAuth = useMSAuth()
  const accounts = msAuth.getAccounts()
  const userStore = useAppUser()
  const accessToken = await msAuth.acquireTokenSilent()
  const isAuthenticated = msAuth.isAuthenticated() && accessToken

  if (isAuthenticated && accounts.length > 0) {
    const account = accounts[0]

    if (!account) {
      return navigateTo('/login', { replace: true })
    }

    const user = {
      ...account,
      bearerToken: accessToken
    }

    localStorage.setItem('user', JSON.stringify(user))
    userStore.value.user = {
      localAccountId: account.localAccountId,
      homeAccountId: account.homeAccountId,
      username: account.username,
      name: account.name,
      email: account.username
    }

    // Sync user with database
    try {
      const dbUser = await $fetch<DatabaseUser>('/api/users/sync', {
        method: 'POST',
        body: {
          email: account.username,
          name: account.name
        }
      })
      userStore.value.dbUser = dbUser
      userStore.value.user.role = dbUser.role
      userStore.value.user.schoolId = dbUser.schoolId
      userStore.value.user.schoolName = dbUser.schoolName
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Failed to sync user with database:', message)
    }
  }

  if (to.name !== 'login' && !isAuthenticated) {
    return navigateTo('/login', { replace: true })
  } else if (to.name === 'login' && isAuthenticated) {
    return navigateTo('/', { replace: true })
  } else {
    return
  }
})
