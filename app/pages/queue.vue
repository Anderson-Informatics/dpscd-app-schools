<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import type { User } from '~/types'
import type { Result } from '~~/types/result'
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  notes: z.string(),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  notes: '',
})

// Load all of the key placement change functions/refs from composable
const actions = useActions()

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')


// Get the results and schools data from the Pinia store
const resultStore = useResultStore()
await useAsyncData("results", () => resultStore.getAll(), {})
await useAsyncData("pendingOffers", () => resultStore.getPending(), {});
await useAsyncData("schools", () => resultStore.getSchools(), {})
const changeStore = useChangeStore()
await useAsyncData("changes", () => changeStore.getAll(), {})
const settingsStore = useSettingsStore()
await useAsyncData("settings", () => settingsStore.getSettings(), {})

const columnVisibility = ref({ '_id': false })
const rowSelection = ref({})
const statusFilter = ref('all')
const schoolFilter = ref('all')
const listFilter = ref('all')
const gradeFilter = ref('all')

watch(() => schoolFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return

  const schoolColumn = table.value.tableApi.getColumn('School')
  if (!schoolColumn) return

  if (newVal === 'all') {
    schoolColumn.setFilterValue(undefined)
  } else {
    schoolColumn.setFilterValue(newVal)
  }
})

watch(() => listFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return

  const listColumn = table.value.tableApi.getColumn('lotteryList')
  if (!listColumn) return

  if (newVal === 'all') {
    listColumn.setFilterValue(undefined)
  } else {
    listColumn.setFilterValue(newVal)
  }
})

watch(() => gradeFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return

  const gradeColumn = table.value.tableApi.getColumn('Grade')
  if (!gradeColumn) return

  if (newVal === 'all') {
    gradeColumn.setFilterValue(undefined)
  } else {
    gradeColumn.setFilterValue(newVal)
  }
})

const { data, status } = await useFetch<User[]>('/api/customers', {
  lazy: true
})

// This is the drop down menu for the row actions
function getRowItems(row: Row<Result>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'View applicant/submission details',
      icon: 'i-lucide-list',
      onSelect() {
        navigateTo('submissions/' + row.original.submissionId)
      }
    },
    {
      label: 'Copy ID',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original._id.toString())
        toast.add({
          title: 'Copied to clipboard',
          description: 'ID copied to clipboard'
        })
      }
    },
    {
      label: 'View on Submittable',
      icon: 'i-lucide-external-link',
      onSelect() {
        navigateTo('https://dpscd.submittable.com/submissions/' + row.original.submissionId, {
          external: true,
          open: {
            target: '_blank'
          }
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Accept Offer',
      icon: 'i-lucide-list-check',
      color: 'success',
      onSelect() {
        loadItem({ ...row.original, action: 'Accept', actionLong: 'Add to Offered List', stage: actions.buttonText.value })
      }
    },
    {
      label: 'Decline Offer',
      icon: 'i-lucide-list-x',
      color: 'error',
      onSelect() {
        loadItem({ ...row.original, action: 'Decline', actionLong: 'Decline Offer from Waitlist', stage: actions.buttonText.value })
      }
    },
    {
      label: 'Move to Secondary Waitlist',
      icon: 'i-lucide-list-end',
      color: 'warning',
      onSelect() {
        loadItem({ ...row.original, action: 'Secondary', actionLong: 'Move to Secondary Waitlist', stage: actions.buttonText.value })
      }
    },
    /*
    {
      type: 'separator'
    },
    {
      label: 'Delete customer',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        toast.add({
          title: 'Customer deleted',
          description: 'The customer has been deleted.'
        })
      }
    }
    */
  ]
}

const columns: TableColumn<Result>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : ''
          ]
        },
        onClick: () => row.toggleExpanded()
      })
  },
  {
    accessorKey: '_id',
    header: 'ID',
  },
  {
    accessorKey: 'queueDate',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Date Added',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      return new Date(row.getValue('queueDate')).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    },
  },
  {
    accessorKey: 'FirstName',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'First',
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
    accessorKey: 'LastName',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Last',
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
    accessorKey: 'ChoiceRank',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Choice',
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
    accessorKey: 'lotteryList',
    header: 'List',
    cell: ({ cell }) => {
      const status = cell.getValue() as string
      return h(UButton, {
        label: status,
        color: status === 'Offered List' ? 'success' : status === 'Waiting List' ? 'info' : status === 'Secondary Waitlist' ? 'warning' : status === 'Forfeited' ? 'error' : 'neutral',
        variant: 'subtle',
      })
    }
  },
  {
    accessorKey: 'queueStatus',
    header: 'Queue',
    cell: ({ cell }) => {
      const status = cell.getValue() as string
      return h(UButton, {
        label: status,
        color: status === 'Offer Pending' ? 'success' : 'content-none',
        variant: 'subtle',
      })
    }
  },
  {
    accessorKey: 'adjustedRank',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Rank',
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
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
]

// This is the default expanded state for the table
const expanded = ref({ 1: true })

// This is the default sorting for the table
const sorting = ref([
  {
    id: 'queueDate',
    desc: false
  }
])

const globalFilter = ref('')

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

// Helpers for the edit modal component
const formValues = ref<Result>({
  _id: '',
  submissionId: '',
  rank: 0,
  Grade: '',
  SchoolID: 0,
  School: '',
  FirstName: '',
  LastName: '',
  ChoiceRank: 0,
  submissionDate: '',
  lotteryList: '',
})

// This will reset the edit modal component
const loadItem = (val: Result) => {
  console.log("loadItem: ", val)
  formValues.value = val
  actions.showModal.value = true
  // These are the empty starting defaults for the form
  actions.pendingChanges.value = []
  actions.pendingStatus.value = false
  actions.buttonText.value = "Check"
  actions.pendingIds.value = []
}
</script>

<template>
  <UDashboardPanel id="queue">
    <template #header>
      <UDashboardNavbar title="Offer Queue">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UModal v-model:open="actions.showModal.value" title="Offer Queue Update Form"
          description="Verify and log changes to offers in queue" :ui="{ footer: 'justify-end' }">
          <!--
          <UButton label="Open" color="neutral" variant="subtle" />
          -->

          <template #body>
            <UForm :schema="schema" :state="state">
              {{ formValues.action }} for {{ formValues.FirstName }} {{ formValues.LastName }}
              <UFormField label="Notes" name="notes">
                <UTextarea v-model="formValues.notes" placeholder="Add your notes/reasoning for changes..."
                  class="w-full" />
              </UFormField>
              <div v-if="actions.pendingChanges.value.length > 0">
                <p class="mt-6 text-lg">Pending changes:</p>
                <ol class="text-left list-decimal list-inside mt-2 mb-4">
                  <li v-for="(change, index) in actions.pendingChanges.value" class="mb-2">
                    {{ change }}
                  </li>
                </ol>
              </div>
            </UForm>
          </template>

          <template #footer>
            <UButton label="Cancel" color="neutral" variant="outline"
              @click="actions.showModal.value = false; actions.buttonText.value = 'Check'" />
            <UButton :label="actions.buttonText.value" color="neutral"
              @click="actions.runAction({ ...formValues, stage: actions.buttonText.value })" />
          </template>
        </UModal>
        <!--
        <UInput :model-value="(table?.tableApi?.getColumn('FirstName')?.getFilterValue() as string)" class="max-w-sm"
          icon="i-lucide-search" placeholder="Find by first name..."
          @update:model-value="table?.tableApi?.getColumn('FirstName')?.setFilterValue($event)" />
        -->
        <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." />

        <div class="flex flex-wrap items-center gap-1.5">
          <CustomersDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
            <UButton v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length" label="Delete" color="error"
              variant="subtle" icon="i-lucide-trash">
              <template #trailing>
                <UKbd>
                  {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                </UKbd>
              </template>
            </UButton>
          </CustomersDeleteModal>

          <USelect v-model="statusFilter" :items="[
            { label: 'All', value: 'all' },
            { label: 'Subscribed', value: 'subscribed' },
            { label: 'Unsubscribed', value: 'unsubscribed' },
            { label: 'Bounced', value: 'bounced' }
          ]" :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Filter status" class="min-w-28" />
          <USelect v-model="schoolFilter" :items="[
            { label: 'All Schools', value: 'all' },
            { label: 'Bates', value: 'Bates Academy' },
            { label: 'Chrysler', value: 'Chrysler Elementary' },
            { label: 'Edison', value: 'Edison Elementary' },
            { label: 'Edmonson', value: 'Edmonson Elementary' },
            { label: 'FLICS', value: 'Foreign Language Immersion and Cultural Studies School' },
            { label: 'Marygrove', value: 'The School at Marygrove' },
            { label: 'Palmer Park', value: 'Palmer Park Preparatory Academy' }
          ]" :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Filter status" class="min-w-28" />
          <USelect v-model="listFilter" :items="[
            { label: 'All Lists', value: 'all' },
            { label: 'Offered', value: 'Offered List' },
            { label: 'Waiting List', value: 'Waiting List' },
            { label: 'Forfeited', value: 'Forfeited' },
            { label: 'Secondary WL', value: 'Secondary Waitlist' }
          ]" :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Filter status" class="min-w-28" />
          <USelect v-model="gradeFilter" :items="[
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
          ]" :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Filter status" class="min-w-28" />
          <UDropdownMenu :items="table?.tableApi
            ?.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => ({
              label: upperFirst(column.id),
              type: 'checkbox' as const,
              checked: column.getIsVisible(),
              onUpdateChecked(checked: boolean) {
                table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
              },
              onSelect(e?: Event) {
                e?.preventDefault()
              }
            }))
            " :content="{ align: 'end' }">
            <UButton label="Display" color="neutral" variant="outline" trailing-icon="i-lucide-settings-2" />
          </UDropdownMenu>
        </div>
      </div>

      <UTable ref="table" v-model:expanded="expanded" v-model:sorting="sorting" v-model:global-filter="globalFilter"
        v-model:column-visibility="columnVisibility" v-model:row-selection="rowSelection"
        v-model:pagination="pagination" :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }" class="shrink-0" :data="resultStore.pendingOffers" :columns="columns" :loading="status === 'pending'" :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
          td: 'border-b border-(--ui-border)'
        }">
        <template #expanded="{ row }" class="flex">
          <UCard variant="outline" class="mb-4">
            <template #header>
              Parent Contact Details for {{ row.original.FirstName }} {{ row.original.LastName }}
            </template>

            <div v-if="row.original.contact">
              {{ row.original.contact.ParentFirst }}
              {{ row.original.contact.ParentLast }}<br />
              {{ row.original.contact.ParentPhone }}<br />
              {{ row.original.contact.ParentEmail }}
            </div>
            <div v-else>
              Reload the page to fetch the contact details.
            </div>
          </UCard>
          <UCard variant="outline" class="mb-4">
            <template #header>
              Placement Details for {{ row.original.FirstName }} {{ row.original.LastName }}
            </template>

            <div v-if="row.original.results">
              <div v-for="(result, index) in row.original.results" :key="index" class="mb-4">
                <strong v-if="result.School">{{ result.School }}</strong><br />
                Choice: &nbsp;{{ result.ChoiceRank }}<br />
                {{ result.lotteryList }}
                <span v-if="result.adjustedRank"> Position {{ result.adjustedRank }}</span>
              </div>
            </div>
            <div v-else>
              Reload the page to fetch the contact details.
            </div>
          </UCard>
        </template>
      </UTable>

      <div class="flex items-center justify-between gap-3 border-t border-(--ui-border) pt-4 mt-auto">
        <div class="text-sm text-(--ui-text-muted)">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
