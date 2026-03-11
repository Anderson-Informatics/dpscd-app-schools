import type { DatabaseUser } from '~/types'

type AppUserState = {
  user: {
    localAccountId?: string
    homeAccountId?: string
    username?: string
    name?: string
    email?: string
    role?: string
    schoolId?: number
    schoolName?: string
  }
  avatar: {
    src: string | null
    alt: string
  }
  dbUser: DatabaseUser | null
}

export const useAppUser = () => {
  return useState<AppUserState>('user', () => ({
    user: {},
    avatar: {
      src: null,
      alt: ''
    },
    dbUser: null
  }))
}
