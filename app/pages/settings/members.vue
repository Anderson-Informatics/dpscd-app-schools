<script setup lang="ts">
import type { Member, DatabaseUser } from '~/types'

const toast = useToast()
const appUser = useAppUser()

const { data: dbUsers } = await useFetch<DatabaseUser[]>('/api/users', {
  default: () => []
})

const schoolsList = [
  {
    schoolId: 2882,
    schoolName: 'Bates'
  },
  {
    schoolId: 3638,
    schoolName: 'Marygrove'
  },
  {
    schoolId: 1552,
    schoolName: 'Palmer Park'
  },
  {
    schoolId: 689,
    schoolName: 'Chrysler'
  },
  {
    schoolId: 3639,
    schoolName: 'Edmonson'
  },
  {
    schoolId: 1084,
    schoolName: 'Edison'
  },
  {
    schoolId: 1555,
    schoolName: 'FLICS'
  }
]

const members = computed<Member[]>(() => {
  return (dbUsers.value || []).map((member) => ({
    _id: member._id,
    name: member.name,
    email: member.email,
    role: member.role,
    schoolId: member.schoolId,
    schoolName: member.schoolName,
    avatar: {
      src: undefined,
      alt: member.name
    }
  }))
})

const currentUserEmail = computed(() => {
  return appUser.value.user.email?.trim().toLowerCase() || ''
})

type MemberUpdatePayload = {
  memberId: string
  role: Member['role']
  schoolId?: number
  schoolName?: string
}

const updateMember = async (payload: MemberUpdatePayload) => {
  try {
    console.log('Updating member with payload:', payload)
    await $fetch<DatabaseUser>(`/api/users/${payload.memberId}`, {
      method: 'PATCH',
      body: {
        role: payload.role,
        schoolId: payload.schoolId,
        schoolName: payload.schoolName
      }
    })

    const dbUser = dbUsers.value.find((item) => item._id === payload.memberId)
    if (dbUser && dbUsers.value) {
      dbUsers.value = dbUsers.value.map((item) => {
        if (item._id !== payload.memberId) {
          return item
        }

        return {
          ...item,
          role: payload.role,
          schoolId: payload.schoolId,
          schoolName: payload.schoolName
        }
      })

      toast.add({
        title: 'Team member updated',
        description:
          payload.role === 'school admin' && payload.schoolName
            ? `${dbUser.name} is now ${payload.role} (${payload.schoolName}).`
            : `${dbUser.name} is now ${payload.role}.`,
        color: 'success'
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Failed to update member:', message)
  }
}

const removeMember = async (payload: { memberId: string }) => {
  const dbUser = dbUsers.value.find((item) => item._id === payload.memberId)

  try {
    await $fetch<DatabaseUser>(`/api/users/${payload.memberId}`, {
      method: 'PATCH',
      body: { role: 'unassigned' }
    })

    if (dbUser && dbUsers.value) {
      dbUsers.value = dbUsers.value.map((item) => {
        if (item._id !== payload.memberId) {
          return item
        }

        return {
          ...item,
          role: 'unassigned',
          schoolId: undefined,
          schoolName: undefined
        }
      })

      toast.add({
        title: 'Team member removed',
        description: `${dbUser.name} has been removed from the team.`,
        color: 'success'
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Failed to remove member:', message)
  }
}

const q = ref('')

const filteredMembers = computed(() => {
  return members.value.filter((member) => {
    return (
      member.name.search(new RegExp(q.value, 'i')) !== -1 ||
      member.email.search(new RegExp(q.value, 'i')) !== -1
    )
  })
})
</script>

<template>
  <div>
    <UPageCard
      title="Team"
      description="Invite new team members by email address."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton label="Invite people" color="neutral" class="w-fit lg:ms-auto" />
    </UPageCard>

    <UPageCard
      variant="subtle"
      :ui="{
        container: 'p-0 sm:p-0 gap-y-0',
        header: 'p-4 mb-0 border-b border-(--ui-border)'
      }"
    >
      <template #header>
        <UInput
          v-model="q"
          icon="i-lucide-search"
          placeholder="Search team members"
          autofocus
          class="w-full"
        />
      </template>

      <SettingsMembersList
        :members="filteredMembers"
        :schools="schoolsList"
        :current-user-email="currentUserEmail"
        @update-member="updateMember"
        @remove-member="removeMember"
      />
    </UPageCard>
  </div>
</template>
