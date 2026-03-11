<script setup lang="ts">
import type { Member } from '~/types'

const props = defineProps<{
  members: Member[]
  schools: Array<{
    schoolId: number
    schoolName: string
  }>
  currentUserEmail?: string
}>()

const emit = defineEmits<{
  'update-member': [
    payload: {
      memberId: string
      role: Member['role']
      schoolId?: number
      schoolName?: string
    }
  ]
  'remove-member': [payload: { memberId: string }]
}>()

const schoolItems = computed(() => {
  const uniqueSchools = new Map<number, { schoolId: number; schoolName: string }>()

  props.schools.forEach((school) => {
    if (!uniqueSchools.has(school.schoolId)) {
      uniqueSchools.set(school.schoolId, school)
    }
  })

  return Array.from(uniqueSchools.values())
    .map((school) => ({
      label: school.schoolName,
      value: school.schoolName,
      schoolId: school.schoolId
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const roleItems: Array<{ label: string, value: Member['role'] }> = [
  { label: 'Unassigned', value: 'unassigned' },
  { label: 'School Admin', value: 'school admin' },
  { label: 'Central Office Admin', value: 'central office admin' }
]

const normalizeSelectValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && value !== null && 'value' in value) {
    const optionValue = (value as { value?: unknown }).value
    return typeof optionValue === 'string' ? optionValue : undefined
  }

  return undefined
}

const isLoggedInUser = (member: Member) => {
  const currentUserEmail = props.currentUserEmail?.trim().toLowerCase()
  const memberEmail = member.email?.trim().toLowerCase()

  if (!currentUserEmail || !memberEmail) {
    return false
  }

  return currentUserEmail === memberEmail
}

const getMemberSchoolValue = (member: Member) => {
  if (member.schoolName) {
    return member.schoolName
  }

  if (typeof member.schoolId === 'number') {
    const matched = props.schools.find((item) => item.schoolId === member.schoolId)
    return matched?.schoolName
  }

  return undefined
}

const updateMemberRole = (member: Member, role: Member['role']) => {
  console.log('Updating member role:', { memberId: member._id, newRole: role })
  if (!member._id) {
    return
  }

  // if (role !== '') {
  emit('update-member', {
    memberId: member._id,
    role
  })
  return
}

const handleRoleUpdate = (member: Member, value: unknown) => {
  const normalizedValue = normalizeSelectValue(value)
  console.log('Normalized role value:', normalizedValue)
  if (!normalizedValue) {
    return
  }

  if (
    normalizedValue === 'unassigned' ||
    normalizedValue === 'school admin' ||
    normalizedValue === 'central office admin'
  ) {
    updateMemberRole(member, normalizedValue)
  }
}

const updateMemberSchool = (member: Member, schoolShortName: unknown) => {
  if (!member._id) {
    return
  }

  const selectedShortName = normalizeSelectValue(schoolShortName)

  if (!selectedShortName) {
    return
  }

  const school = props.schools.find((item) => item.schoolName === selectedShortName)

  if (!school) {
    return
  }

  emit('update-member', {
    memberId: member._id,
    role: member.role,
    schoolId: school.schoolId,
    schoolName: school.schoolName
  })
}

const getMemberItems = (member: Member) => [
  {
    label: 'Edit team member',
    onSelect: () => console.log('Edit team member')
  },
  {
    label: 'Remove team member',
    color: 'error' as const,
    disabled: isLoggedInUser(member),
    onSelect: () => {
      if (isLoggedInUser(member)) return
      if (!member._id) return
      emit('remove-member', { memberId: member._id })
    }
  }
]
</script>

<template>
  <ul role="list" class="divide-y divide-(--ui-border)">
    <li
      v-for="(member, index) in members"
      :key="member._id || index"
      class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6"
    >
      <div class="flex items-center gap-3 min-w-0">
        <UAvatar :src="member.avatar?.src" :alt="member.avatar?.alt || member.name" size="md" />

        <div class="text-sm min-w-0">
          <p class="text-(--ui-text-highlighted) font-medium truncate">
            {{ member.name }}
          </p>
          <p class="text-(--ui-text-muted) truncate">
            {{ member.email }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 sm:min-w-[24rem] justify-end">
        <USelect
          :model-value="member.role"
          :items="roleItems"
          color="neutral"
          :ui="{ value: 'capitalize', item: 'capitalize' }"
          :disabled="isLoggedInUser(member)"
          @update:model-value="handleRoleUpdate(member, $event)"
        />

        <USelect
          v-if="member.role === 'school admin'"
          :model-value="getMemberSchoolValue(member)"
          :items="schoolItems"
          placeholder="Assign school"
          color="neutral"
          class="w-64"
          @update:model-value="updateMemberSchool(member, $event)"
        />

        <UDropdownMenu :items="getMemberItems(member)" :content="{ align: 'end' }">
          <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
        </UDropdownMenu>
      </div>
    </li>
  </ul>
</template>
