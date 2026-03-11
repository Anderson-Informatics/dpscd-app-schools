<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()

const { teams, setYear, year } = useAppYear()

const activeTeam = computed(() => {
  const activeYear = String(year.value ?? '').trim()
  return teams.find((team) => team.year === activeYear) ?? teams[0]
})

const activeTeamLabel = computed(() => activeTeam.value?.label ?? `${year.value} Apps`)
const activeTeamAvatar = computed(() => activeTeam.value?.avatar)
const activeYearShort = computed(() => String(year.value ?? '').slice(-2))

const items = computed(() => {
  return [
    teams.map((team) => ({
      label: team.label,
      avatar: team.avatar,
      async onSelect() {
        if (team.year !== year.value) {
          setYear(team.year)
          await refreshNuxtData()
        }
      }
    })),
    [
      {
        label: 'Create team',
        icon: 'i-lucide-circle-plus'
      },
      {
        label: 'Manage teams',
        icon: 'i-lucide-cog'
      }
    ]
  ]
})
</script>

<template>
  <UDropdownMenu
    :key="`menu-${year}`"
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)'
    }"
  >
    <div class="relative w-full">
      <UButton
        :key="`team-${year}`"
        :label="collapsed ? undefined : activeTeamLabel"
        :avatar="activeTeamAvatar"
        color="neutral"
        variant="ghost"
        block
        :square="collapsed"
        :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
        class="data-[state=open]:bg-(--ui-bg-elevated)"
        :class="[!collapsed && 'py-2']"
        :ui="{
          trailingIcon: 'text-(--ui-text-dimmed)'
        }"
      />

      <span
        v-if="collapsed"
        class="absolute right-1 top-1 rounded bg-(--ui-primary) px-1 text-[10px] font-semibold leading-4 text-(--ui-bg)"
      >
        {{ activeYearShort }}
      </span>
    </div>
  </UDropdownMenu>
</template>
