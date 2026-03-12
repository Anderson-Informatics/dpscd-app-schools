import type { H3Event } from 'h3'
import User from '~~/server/models/user.model'

export const SCHOOL_ADMIN_VISIBLE_LISTS = [
  'Offered List',
  'Waiting List',
  'Secondary Waitlist'
] as const

export type ScopedUser = {
  role: 'central office admin' | 'school admin' | 'unassigned' | null
  schoolId?: number
  schoolName?: string
  userEmail?: string
}

const SCOPED_USER_ROLES = ['central office admin', 'school admin', 'unassigned'] as const
type ScopedUserRole = (typeof SCOPED_USER_ROLES)[number]

const isScopedUserRole = (value: unknown): value is ScopedUserRole => {
  return typeof value === 'string' && (SCOPED_USER_ROLES as readonly string[]).includes(value)
}

export const getScopedUser = async (
  event: H3Event,
  fallbackEmail?: string
): Promise<ScopedUser> => {
  const query = getQuery(event) as { userEmail?: string }
  const userEmailFromQuery =
    typeof query.userEmail === 'string' ? query.userEmail.toLowerCase().trim() : undefined
  const userEmail = userEmailFromQuery || fallbackEmail?.toLowerCase().trim()

  if (!userEmail) {
    return { role: null }
  }

  const user = await User.findOne({ email: userEmail }).lean()

  if (!user) {
    return {
      role: null,
      userEmail
    }
  }

  return {
    role: isScopedUserRole(user.role) ? user.role : null,
    schoolId: typeof user.schoolId === 'number' ? user.schoolId : undefined,
    schoolName: typeof user.schoolName === 'string' ? user.schoolName : undefined,
    userEmail
  }
}
