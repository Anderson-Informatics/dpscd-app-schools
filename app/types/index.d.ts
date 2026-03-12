import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'
export type UserRole = 'central office admin' | 'school admin' | 'unassigned'

export interface Avatar {
  src?: string
  alt?: string
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface DatabaseUser {
  _id: string
  email: string
  name: string
  role: UserRole
  schoolId?: number
  schoolName?: string
  createdAt: Date
  updatedAt: Date
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  _id?: string
  name: string
  username?: string
  email: string
  role: UserRole
  schoolId?: number
  schoolName?: string
  avatar?: Avatar
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export interface Setting {
  applyLabels: boolean
  applyNotes: boolean
}
