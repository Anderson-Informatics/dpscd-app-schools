<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel, type Row } from '@tanstack/table-core'
import type { User } from '~/types'
import type { Submission } from '~~/types/submission'
import { UPageLinks } from '#components'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const ULink = resolveComponent('ULink')

const toast = useToast()
const table = useTemplateRef('table')

// Get the submission data from the Pinia
const submissionStore = useSubmissionStore();
await useAsyncData("submissions", () => submissionStore.getAll(), {});
const settingsStore = useSettingsStore()
await useAsyncData("settings", () => settingsStore.getSettings(), {})

const columnVisibility = ref({ '_id': false, 'submissionId': false })
const rowSelection = ref({})
const gradeFilter = ref('all')

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

function getRowItems(row: Row<Submission>) {
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

// Setting for the table display
const columns: TableColumn<Submission>[] = [
  {
    accessorKey: '_id',
    header: 'ID',
  },
  {
    accessorKey: 'submissionId',
    header: 'Submission ID'
  },
  {
    accessorKey: 'FullName',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Full',
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
      const fullname = row.getValue('FullName') as string
      const sid = row.getValue('submissionId') as string
      return h(ULink, {
        to: `/submissions/${sid}`
      }, fullname)
    }
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
    accessorKey: 'topPlacement.School',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Top Placement School',
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
    accessorKey: 'topPlacement.status',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Top Placement Status',
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

// This is the default sorting for the table
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
  <UDashboardPanel id="submissions">
    <template #header>
      <UDashboardNavbar title="Submissions">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <!--
        <template #right>
          <CustomersAddModal />
        </template>
        -->
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
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

      <UTable ref="table" v-model:sorting="sorting" v-model:global-filter="globalFilter"
        v-model:column-visibility="columnVisibility" v-model:row-selection="rowSelection"
        v-model:pagination="pagination" :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }" class="shrink-0" :data="submissionStore.submissions" :columns="columns" :loading="status === 'pending'" :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
          td: 'border-b border-(--ui-border)'
        }" />

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
