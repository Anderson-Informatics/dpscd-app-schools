<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Assignment } from '~~/types/assignment'

type CompletionFilter = 'complete' | 'incomplete' | null

type AssignmentSummaryRow = {
  stageName: string
  total: number
  complete: number
  incomplete: number
  completionRate: number
}

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const { withYearQuery } = useAppYear()

const { data, status, error, refresh } = await useFetch<Assignment[]>('/api/assignments', {
  query: computed(() => withYearQuery()),
  default: () => []
})

const selectedStage = ref<string | null>(null)
const selectedCompletion = ref<CompletionFilter>(null)

const assignments = computed(() => data.value ?? [])

const getStageName = (value?: string | null) => {
  if (!value || !value.trim()) {
    return 'Unknown Stage'
  }

  return value.trim()
}

const isAssignmentComplete = (assignment: Assignment) => {
  if (typeof assignment.AssignmentCompleted === 'boolean') {
    return assignment.AssignmentCompleted
  }

  return assignment.AssignmentComplete === true
}

const assignmentSummary = computed<AssignmentSummaryRow[]>(() => {
  const grouped = assignments.value.reduce<Record<string, AssignmentSummaryRow>>((acc, assignment) => {
    const stageName = getStageName(assignment.stageName)

    if (!acc[stageName]) {
      acc[stageName] = {
        stageName,
        total: 0,
        complete: 0,
        incomplete: 0,
        completionRate: 0
      }
    }

    acc[stageName].total += 1

    if (isAssignmentComplete(assignment)) {
      acc[stageName].complete += 1
    } else {
      acc[stageName].incomplete += 1
    }

    return acc
  }, {})

  return Object.values(grouped)
    .map((row) => ({
      ...row,
      completionRate: row.total > 0 ? (row.complete / row.total) * 100 : 0
    }))
    .sort((a, b) => a.stageName.localeCompare(b.stageName, undefined, { sensitivity: 'base' }))
})

const toggleDetail = (
  stageName: string,
  statusToShow: Exclude<CompletionFilter, null>
) => {
  const isSameSelection =
    selectedStage.value === stageName && selectedCompletion.value === statusToShow

  selectedStage.value = isSameSelection ? null : stageName
  selectedCompletion.value = isSameSelection ? null : statusToShow
}

const selectedRows = computed(() => {
  if (!selectedStage.value || !selectedCompletion.value) {
    return []
  }

  return assignments.value.filter((assignment) => {
    if (getStageName(assignment.stageName) !== selectedStage.value) {
      return false
    }

    const complete = isAssignmentComplete(assignment)
    return selectedCompletion.value === 'complete' ? complete : !complete
  })
})

const detailTitle = computed(() => {
  if (!selectedStage.value || !selectedCompletion.value) {
    return 'Assignment Details'
  }

  return `${selectedStage.value} - ${selectedCompletion.value === 'complete' ? 'Complete' : 'Incomplete'} Assignments`
})

const detailDescription = computed(() => {
  if (!selectedCompletion.value) {
    return 'Click a complete or incomplete total in the summary table to load details.'
  }

  return `Showing ${selectedRows.value.length} ${selectedCompletion.value} assignment${selectedRows.value.length === 1 ? '' : 's'} for ${selectedStage.value}.`
})

const summaryColumns: TableColumn<AssignmentSummaryRow>[] = [
  {
    accessorKey: 'stageName',
    header: 'Stage Name'
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => row.original.total.toLocaleString('en-US')
  },
  {
    accessorKey: 'complete',
    header: 'Complete',
    cell: ({ row }) => {
      const isSelected =
        selectedStage.value === row.original.stageName && selectedCompletion.value === 'complete'

      return h(
        UButton,
        {
          color: isSelected ? 'success' : 'neutral',
          variant: isSelected ? 'solid' : 'outline',
          size: 'xs',
          onClick: () => toggleDetail(row.original.stageName, 'complete')
        },
        () => row.original.complete.toLocaleString('en-US')
      )
    }
  },
  {
    accessorKey: 'incomplete',
    header: 'Incomplete',
    cell: ({ row }) => {
      const isSelected =
        selectedStage.value === row.original.stageName && selectedCompletion.value === 'incomplete'

      return h(
        UButton,
        {
          color: isSelected ? 'warning' : 'neutral',
          variant: isSelected ? 'solid' : 'outline',
          size: 'xs',
          onClick: () => toggleDetail(row.original.stageName, 'incomplete')
        },
        () => row.original.incomplete.toLocaleString('en-US')
      )
    }
  },
  {
    accessorKey: 'completionRate',
    header: 'Completion %',
    cell: ({ row }) => `${row.original.completionRate.toFixed(1)}%`
  }
]

const detailColumns: TableColumn<Assignment>[] = [
  {
    accessorKey: 'FullName',
    header: 'Student',
    cell: ({ row }) => {
      const submittableId = row.original.submissionIdInt
      const name = row.original.FullName?.trim() || 'Unknown Student'

      if (!submittableId) {
        return name
      }

      return h(
        'a',
        {
          href: `https://dpscd.submittable.com/submissions/${submittableId}`,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'font-medium text-(--ui-primary) hover:underline'
        },
        name
      )
    }
  },
  {
    accessorKey: 'submissionIdInt',
    header: 'Submittable ID',
    cell: ({ row }) => row.original.submissionIdInt || 'N/A'
  },
  {
    accessorKey: 'ReviewerName',
    header: 'Reviewer',
    cell: ({ row }) => row.original.ReviewerName || 'Unassigned'
  },
  {
    accessorKey: 'ReviewerTitle',
    header: 'Reviewer Team',
    cell: ({ row }) => row.original.ReviewerTitle || 'N/A'
  },
  {
    accessorKey: 'ReviewerSchoolName',
    header: 'Reviewer School',
    cell: ({ row }) => row.original.ReviewerSchoolName || 'N/A'
  },
  {
    accessorKey: 'submissionStatus',
    header: 'Submission Status',
    cell: ({ row }) => row.original.submissionStatus || 'N/A'
  },
  {
    accessorKey: 'ReviewStatusMatched',
    header: 'Review Status',
    cell: ({ row }) => row.original.ReviewStatusMatched || 'N/A'
  },
  {
    id: 'assignmentStatus',
    header: 'Assignment',
    cell: ({ row }) =>
      h(
        UBadge,
        {
          color: isAssignmentComplete(row.original) ? 'success' : 'warning',
          variant: 'subtle'
        },
        () => (isAssignmentComplete(row.original) ? 'Complete' : 'Incomplete')
      )
  }
]
</script>

<template>
  <UDashboardPanel id="assignments">
    <template #header>
      <UDashboardNavbar title="Assignments" :ui="{ right: 'gap-2' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            label="Refresh"
            color="neutral"
            variant="ghost"
            :loading="status === 'pending'"
            @click="refresh()"
          />
          <ActiveYearBadge />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <template v-if="error">
        <p class="text-error">
          Unable to load assignments: {{ error.message }}
        </p>
      </template>

      <template v-else>
        <UPageCard
          title="Assignments Summary"
          description="Each stage shows total assignments and completion split. Click complete or incomplete totals to open details below."
          variant="outline"
        >
          <UTable
            :data="assignmentSummary"
            :columns="summaryColumns"
            :ui="{
              base: 'table-fixed border-separate border-spacing-0',
              thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
              tbody: '[&>tr]:last:[&>td]:border-b-0',
              th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
              td: 'border-b border-(--ui-border) py-3 align-top'
            }"
          />

          <p v-if="assignmentSummary.length === 0" class="mt-3 text-sm text-muted">
            No assignments were found for the selected year.
          </p>
        </UPageCard>

        <UPageCard
          v-if="selectedCompletion"
          :title="detailTitle"
          :description="detailDescription"
          variant="outline"
          class="mt-4"
        >
          <UTable
            :data="selectedRows"
            :columns="detailColumns"
            :ui="{
              base: 'table-fixed border-separate border-spacing-0',
              thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
              tbody: '[&>tr]:last:[&>td]:border-b-0',
              th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
              td: 'border-b border-(--ui-border) py-3 align-top'
            }"
          />

          <div class="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
            <span>
              Showing {{ selectedRows.length }} {{ selectedCompletion }} assignment{{ selectedRows.length === 1 ? '' : 's' }}.
            </span>

            <UButton
              label="Close"
              color="neutral"
              variant="ghost"
              @click="selectedCompletion = null; selectedStage = null"
            />
          </div>
        </UPageCard>
      </template>
    </template>
  </UDashboardPanel>
</template>
