<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { User } from '~/types'
import type { SchoolGrade } from '~~/types/school'

// Load all of the key placement change functions/refs from composable

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const table = useTemplateRef('table')
const { year, withYearQuery } = useAppYear()

// Get the results and schools data from the Pinia store
const resultStore = useResultStore()
await useAsyncData('results', () => resultStore.getAll(), { watch: [year] })
await useAsyncData('pendingOffers', () => resultStore.getPending(), { watch: [year] })
await useAsyncData('schools', () => resultStore.getSchools(), { watch: [year] })
await useAsyncData('capacity', () => resultStore.getCapacity(), { watch: [year] })
const changeStore = useChangeStore()
await useAsyncData('changes', () => changeStore.getAll(), { watch: [year] })
const settingsStore = useSettingsStore()
await useAsyncData('settings', () => settingsStore.getSettings(), { watch: [year] })

// Admin check and edit modal state
const userStore = useAppUser()
const isAdmin = computed(() => userStore.value.user.role === 'central office admin')
const editModalOpen = ref(false)
const selectedSchoolForEdit = ref<SchoolGrade | null>(null)
const schoolCapacitiesForEdit = ref<SchoolGrade[]>([])
const isSavingCapacity = ref(false)

const openEditModal = (schoolGrade: SchoolGrade) => {
  selectedSchoolForEdit.value = schoolGrade
  // Get all grades for this school
  schoolCapacitiesForEdit.value = resultStore.capacity
    .filter((item) => item.School === schoolGrade.School && item.SchoolID === schoolGrade.SchoolID)
    .map((item) => ({ ...item })) // Deep copy for editing
  editModalOpen.value = true
}

const handleCapacityUpdate = async () => {
  if (!selectedSchoolForEdit.value) return
  try {
    isSavingCapacity.value = true
    // Update each grade capacity
    for (const capacity of schoolCapacitiesForEdit.value) {
      await resultStore.updateCapacity(capacity)
    }
    await resultStore.getCapacity()
    editModalOpen.value = false
    selectedSchoolForEdit.value = null
    schoolCapacitiesForEdit.value = []
  } catch (e) {
    console.error('Error updating capacity:', e)
  } finally {
    isSavingCapacity.value = false
  }
}

const columnVisibility = ref({ _id: false })
const rowSelection = ref({})
const schoolFilter = ref('all')
const listFilter = ref('all')
const gradeFilter = ref('all')

watch(
  () => schoolFilter.value,
  (newVal) => {
    if (!table?.value?.tableApi) return

    const schoolColumn = table.value.tableApi.getColumn('School')
    if (!schoolColumn) return

    if (newVal === 'all') {
      schoolColumn.setFilterValue(undefined)
    } else {
      schoolColumn.setFilterValue(newVal)
    }
  }
)

watch(
  () => listFilter.value,
  (newVal) => {
    if (!table?.value?.tableApi) return

    const listColumn = table.value.tableApi.getColumn('lotteryList')
    if (!listColumn) return

    if (newVal === 'all') {
      listColumn.setFilterValue(undefined)
    } else {
      listColumn.setFilterValue(newVal)
    }
  }
)

watch(
  () => gradeFilter.value,
  (newVal) => {
    if (!table?.value?.tableApi) return

    const gradeColumn = table.value.tableApi.getColumn('Grade')
    if (!gradeColumn) return

    if (newVal === 'all') {
      gradeColumn.setFilterValue(undefined)
    } else {
      gradeColumn.setFilterValue(newVal)
    }
  }
)

const { data, status } = await useFetch<User[]>('/api/customers', {
  query: withYearQuery(),
  lazy: true
})
console.log('Customers data:', data.value)

const columns: TableColumn<SchoolGrade>[] = [
  {
    accessorKey: 'School',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'School',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'Grade',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Grade',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'Capacity',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Capacity',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'SeatsFilled',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Seats Filled',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'OnWaitingList',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'On Waiting List',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'OnSecondaryWaitingList',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'On Seconday WL',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'SeatsAvailable',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Seats Available',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    enableHiding: false,
    cell: ({ row }) => {
      if (!isAdmin.value) return null
      return h('div', { class: 'flex gap-2' }, [
        h(UButton, {
          size: 'sm',
          color: 'primary',
          variant: 'soft',
          icon: 'i-lucide-pencil',
          label: 'Edit',
          onClick: () => openEditModal(row.original as SchoolGrade)
        })
      ])
    }
  }
]

const sorting = ref([
  {
    id: 'LastName',
    desc: false
  }
])

const globalFilter = ref('')

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>

<template>
  <UDashboardPanel id="capacity">
    <template #header>
      <UDashboardNavbar title="School Capacity">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <ActiveYearBadge />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          v-model="globalFilter"
          class="max-w-sm"
          placeholder="Filter..."
        />
        <div class="flex flex-wrap items-center gap-1.5">
          <USelect
            v-model="schoolFilter"
            :items="[
              { label: 'All Schools', value: 'all' },
              { label: 'Bates', value: 'Bates Academy' },
              { label: 'Chrysler', value: 'Chrysler Elementary' },
              { label: 'Edison', value: 'Edison Elementary' },
              { label: 'Edmonson', value: 'Edmonson Elementary' },
              {
                label: 'FLICS',
                value: 'Foreign Language Immersion and Cultural Studies School'
              },
              { label: 'Marygrove', value: 'The School at Marygrove' },
              { label: 'Palmer Park', value: 'Palmer Park Preparatory Academy' }
            ]"
            :ui="{
              trailingIcon:
                'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }"
            placeholder="Filter status"
            class="min-w-28"
          />
          <USelect
            v-model="gradeFilter"
            :items="[
              { label: 'All Grades', value: 'all' },
              { label: 'PreK', value: 'Pre-K' },
              { label: 'K', value: 'Kindergarten' },
              { label: '1', value: '1' },
              { label: '2', value: '2' },
              { label: '3', value: '3' },
              { label: '4', value: '4' },
              { label: '5', value: '5' },
              { label: '6', value: '6' },
              { label: '7', value: '7' },
              { label: '8', value: '8' }
            ]"
            :ui="{
              trailingIcon:
                'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }"
            placeholder="Filter status"
            class="min-w-28"
          />
          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi
                      ?.getColumn(column.id)
                      ?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Display"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:sorting="sorting"
        v-model:global-filter="globalFilter"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="shrink-0"
        :data="resultStore.capacity"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
          td: 'border-b border-(--ui-border)'
        }"
      />

      <div class="flex items-center justify-between gap-3 border-t border-(--ui-border) pt-4 mt-auto">
        <div class="text-sm text-(--ui-text-muted)">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }}
          of
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s)
          selected.
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="
              (table?.tableApi?.getState().pagination.pageIndex || 0) + 1
            "
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Edit Capacity Modal -->
  <UModal
    v-model:open="editModalOpen"
    title="Edit School Capacity"
    :description="selectedSchoolForEdit ? `Update grade capacities for ${selectedSchoolForEdit.School}` : undefined"
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body>
      <UForm
        v-if="selectedSchoolForEdit"
        :state="{ rows: schoolCapacitiesForEdit }"
        class="space-y-4"
        @submit.prevent="handleCapacityUpdate"
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <UFormField
            v-for="(capacity, index) in schoolCapacitiesForEdit"
            :key="`${capacity.SchoolID}-${capacity.Grade}`"
            :label="`Grade ${capacity.Grade}`"
            :name="`capacity-${index}`"
            description="Set to -1 if this grade is not offered"
          >
            <UInput
              v-model.number="capacity.Capacity"
              class="w-full"
              type="number"
              min="-1"
              placeholder="Enter capacity"
            />
          </UFormField>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="editModalOpen = false"
          />
          <UButton
            label="Save Changes"
            type="submit"
            color="primary"
            :loading="isSavingCapacity"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
