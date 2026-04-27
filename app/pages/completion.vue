<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ExamCompletion } from '~~/types/examCompletion'
import type { Review } from '~~/types/review'

type ReviewStatusFilter = 'complete' | 'incomplete' | null
type ReviewChart = 'montessori' | 'exam'
type RoundFilter = 'all' | string
type GradeFilter = 'all' | string

const UBadge = resolveComponent('UBadge')
const { withYearQuery } = useAppYear()

const { data, error } = await useFetch<Review[]>('/api/reviews', {
  query: computed(() => withYearQuery()),
  default: () => []
})

const { data: examData, error: examError } = await useFetch<ExamCompletion[]>('/api/exam-completions', {
  query: computed(() => withYearQuery()),
  default: () => []
})

const reviewType = 'Montessori/Marygrove Review'
const selectedStatus = ref<ReviewStatusFilter>(null)
const selectedChart = ref<ReviewChart>('montessori')
const selectedRound = ref<RoundFilter>('all')
const selectedGrade = ref<GradeFilter>('all')

const normalizedRound = (value: string | null | undefined) => {
  if (!value || !value.trim()) {
    return 'Unspecified'
  }

  return value.trim()
}

const roundOptions = computed(() => {
  const rounds = [...new Set([
    ...(data.value ?? [])
      .filter((review) => review.ReviewType === reviewType)
      .map((review) => normalizedRound(review.Round)),
    ...(examData.value ?? []).map((exam) => normalizedRound(exam.Round))
  ])].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  )

  return [
    { label: 'All Rounds', value: 'all' },
    ...rounds.map((round) => ({ label: round, value: round }))
  ]
})

const normalizedGrade = (value: string | null | undefined) => {
  if (!value || !value.trim()) {
    return 'Unspecified'
  }

  return value.trim()
}

const getGradeSortPriority = (grade: string) => {
  const normalized = grade.trim().toLowerCase()

  if (normalized === 'pre-k' || normalized === 'pre k' || normalized === 'prek') {
    return -2
  }

  if (normalized === 'kindergarten' || normalized === 'k') {
    return -1
  }

  return 0
}

const compareGrades = (a: string, b: string) => {
  const priorityDiff = getGradeSortPriority(a) - getGradeSortPriority(b)

  if (priorityDiff !== 0) {
    return priorityDiff
  }

  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

const gradeOptions = computed(() => {
  const grades = [...new Set([
    ...(data.value ?? [])
      .filter((review) => review.ReviewType === reviewType)
      .map((review) => normalizedGrade(review.GradeEntering)),
    ...(examData.value ?? []).map((exam) => normalizedGrade(exam.GradeEntering))
  ])].sort(compareGrades)

  return [
    { label: 'All Grades', value: 'all' },
    ...grades.map((grade) => ({ label: grade, value: grade }))
  ]
})

const reviews = computed(() =>
  (data.value ?? []).filter((review) => {
    if (review.ReviewType !== reviewType) {
      return false
    }

    if (
      selectedRound.value !== 'all' &&
      normalizedRound(review.Round) !== selectedRound.value
    ) {
      return false
    }

    if (
      selectedGrade.value !== 'all' &&
      normalizedGrade(review.GradeEntering) !== selectedGrade.value
    ) {
      return false
    }

    return true
  })
)

const examCompletions = computed(() =>
  (examData.value ?? []).filter((exam) => {
    if (
      selectedRound.value !== 'all' &&
      normalizedRound(exam.Round) !== selectedRound.value
    ) {
      return false
    }

    if (
      selectedGrade.value !== 'all' &&
      normalizedGrade(exam.GradeEntering) !== selectedGrade.value
    ) {
      return false
    }

    return true
  })
)

const completedReviews = computed(() =>
  reviews.value.filter((review) => review.complete === true)
)

const incompleteReviews = computed(() =>
  reviews.value.filter((review) => review.complete !== true)
)

const totalReviews = computed(() => reviews.value.length)
const completedCount = computed(() => completedReviews.value.length)
const incompleteCount = computed(() => incompleteReviews.value.length)

const completedPercent = computed(() =>
  totalReviews.value > 0 ? (completedCount.value / totalReviews.value) * 100 : 0
)

const chartStyle = computed(() => ({
  background: `conic-gradient(var(--ui-success) 0deg ${(completedPercent.value / 100) * 360}deg, var(--ui-border) ${(completedPercent.value / 100) * 360}deg 360deg)`
}))

const examTotalReviews = computed(() => examCompletions.value.length)
const examCompletedCount = computed(() =>
  examCompletions.value.filter((review) => review.complete === true).length
)
const examIncompleteCount = computed(() => examTotalReviews.value - examCompletedCount.value)
const examCompletedPercent = computed(() =>
  examTotalReviews.value > 0 ? (examCompletedCount.value / examTotalReviews.value) * 100 : 0
)

const examChartStyle = computed(() => ({
  background: `conic-gradient(var(--ui-success) 0deg ${(examCompletedPercent.value / 100) * 360}deg, var(--ui-border) ${(examCompletedPercent.value / 100) * 360}deg 360deg)`
}))

const selectedReviewRows = computed(() => {
  if (selectedStatus.value === 'complete') {
    return completedReviews.value
  }

  if (selectedStatus.value === 'incomplete') {
    return incompleteReviews.value
  }

  return []
})

const selectedExamRows = computed(() => {
  if (selectedStatus.value === 'complete') {
    return examCompletions.value.filter((review) => review.complete === true)
  }

  if (selectedStatus.value === 'incomplete') {
    return examCompletions.value.filter((review) => review.complete !== true)
  }

  return []
})

const selectedCount = computed(() =>
  selectedChart.value === 'exam' ? selectedExamRows.value.length : selectedReviewRows.value.length
)

const selectedChartLabel = computed(() =>
  selectedChart.value === 'exam' ? 'Exam' : 'Montessori/Marygrove'
)

const selectionLabel = computed(() => {
  const prefix = selectedChartLabel.value

  if (selectedStatus.value === 'complete') {
    return `${prefix} Completed Reviews`
  }

  if (selectedStatus.value === 'incomplete') {
    return `${prefix} Incomplete Reviews`
  }

  return 'Review Details'
})

const selectionDescription = computed(() => {
  if (!selectedStatus.value) {
    return 'Condensed review list by selected round and grade.'
  }

  if (selectedChart.value === 'exam') {
    return 'Exam completion table placeholder. Round and grade filtering are already applied for future data.'
  }

  const roundLabel = selectedRound.value === 'all' ? 'all rounds' : selectedRound.value
  const gradeLabel = selectedGrade.value === 'all' ? 'all grades' : selectedGrade.value
  return `Condensed review list for ${selectedStatus.value} Montessori/Marygrove reviews in ${roundLabel}, ${gradeLabel}.`
})

const formatDate = (value?: string | null) => {
  if (!value) {
    return 'Not completed'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatScore = (value?: number | null) => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 'N/A'
}

const toggleStatus = (
  nextChart: ReviewChart,
  nextStatus: Exclude<ReviewStatusFilter, null>
) => {
  const isSameChartAndStatus =
    selectedChart.value === nextChart && selectedStatus.value === nextStatus

  selectedChart.value = nextChart
  selectedStatus.value = isSameChartAndStatus ? null : nextStatus
}

const reviewColumns: TableColumn<Review>[] = [
  {
    accessorKey: 'FullName',
    header: 'Student',
    cell: ({ row }) =>
      h(
        'a',
        {
          href: `https://dpscd.submittable.com/submissions/${row.original.submissionIdInt}`,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'font-medium text-(--ui-primary) hover:underline'
        },
        row.original.FullName
      )
  },
  {
    accessorKey: 'submissionIdInt',
    header: 'Submittable ID'
  },
  {
    accessorKey: 'GradeEntering',
    header: 'Grade'
  },
  {
    accessorKey: 'score',
    header: 'Score',
    cell: ({ row }) => formatScore(row.original.score)
  },
  {
    accessorKey: 'completedAt',
    header: 'Completed At',
    cell: ({ row }) => formatDate(row.original.completedAt)
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        UBadge,
        {
          color: row.original.complete ? 'success' : 'warning',
          variant: 'subtle',
          class: 'capitalize'
        },
        () => (row.original.complete ? 'Complete' : 'Incomplete')
      )
  }
]

const examColumns: TableColumn<ExamCompletion>[] = [
  {
    accessorKey: 'FullName',
    header: 'Student',
    cell: ({ row }) =>
      h(
        'a',
        {
          href: `https://dpscd.submittable.com/submissions/${row.original.submissionIdInt}`,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'font-medium text-(--ui-primary) hover:underline'
        },
        row.original.FullName
      )
  },
  {
    accessorKey: 'submissionIdInt',
    header: 'Submittable ID'
  },
  {
    accessorKey: 'GradeEntering',
    header: 'Grade'
  },
  {
    accessorKey: 'Round',
    header: 'Round',
    cell: ({ row }) => normalizedRound(row.original.Round)
  },
  {
    accessorKey: 'TestDate',
    header: 'Test Date',
    cell: ({ row }) => formatDate(typeof row.original.TestDate === 'string' ? row.original.TestDate : row.original.TestDate?.toString())
  },
  {
    accessorKey: 'ExamScore',
    header: 'Score',
    cell: ({ row }) => formatScore(row.original.ExamScore)
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        UBadge,
        {
          color: row.original.complete ? 'success' : 'warning',
          variant: 'subtle',
          class: 'capitalize'
        },
        () => (row.original.complete ? 'Complete' : 'Incomplete')
      )
  }
]
</script>

<template>
  <UDashboardPanel id="completion">
    <template #header>
      <UDashboardNavbar title="Completion Tracker" :ui="{ right: 'gap-2' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <ActiveYearBadge />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <template v-if="error || examError">
        <p class="text-error">
          Unable to load completion data: {{ error?.message || examError?.message }}
        </p>
      </template>

      <template v-else>
        <div class="mb-4 flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-(--ui-text-highlighted)">
            Filters
          </span>

          <USelect
            v-model="selectedRound"
            :items="roundOptions"
            placeholder="Filter round"
            class="min-w-36"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }"
          />

          <USelect
            v-model="selectedGrade"
            :items="gradeOptions"
            placeholder="Filter grade"
            class="min-w-36"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }"
          />
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <UPageCard title="Montessori/Marygrove Completion Reviews" variant="outline">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex justify-center lg:flex-1">
                <button
                  type="button"
                  class="relative flex h-64 w-64 items-center justify-center rounded-full border border-(--ui-border) transition-transform hover:scale-[1.01]"
                  :style="chartStyle"
                  @click="toggleStatus('montessori', 'complete')"
                >
                  <div class="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-(--ui-bg) text-center shadow-sm ring-1 ring-(--ui-border)">
                    <span class="text-4xl font-semibold text-(--ui-text-highlighted)">
                      {{ completedPercent.toFixed(0) }}%
                    </span>
                    <span class="mt-2 text-sm text-(--ui-text-muted)">
                      {{ completedCount }} of {{ totalReviews }} complete
                    </span>
                  </div>
                </button>
              </div>

              <div class="flex flex-1 flex-col gap-3">
                <button
                  type="button"
                  class="rounded-xl border p-4 text-left transition-colors"
                  :class="selectedChart === 'montessori' && selectedStatus === 'complete' ? 'border-(--ui-success) bg-(--ui-success)/10' : 'border-(--ui-border) hover:bg-(--ui-bg-elevated)/40'"
                  @click="toggleStatus('montessori', 'complete')"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm uppercase tracking-[0.18em] text-(--ui-text-muted)">
                        Complete
                      </p>
                      <p class="mt-1 text-3xl font-semibold text-(--ui-text-highlighted)">
                        {{ completedCount }}
                      </p>
                    </div>

                    <div class="flex h-11 w-11 items-center justify-center rounded-full bg-(--ui-success)/15 text-(--ui-success)">
                      <UIcon name="i-lucide-circle-check-big" class="size-6" />
                    </div>
                  </div>
                  <p class="mt-3 text-sm text-(--ui-text-muted)">
                    {{ completedPercent.toFixed(1) }}% of Montessori/Marygrove reviews are completed.
                  </p>
                </button>

                <button
                  type="button"
                  class="rounded-xl border p-4 text-left transition-colors"
                  :class="selectedChart === 'montessori' && selectedStatus === 'incomplete' ? 'border-(--ui-warning) bg-(--ui-warning)/10' : 'border-(--ui-border) hover:bg-(--ui-bg-elevated)/40'"
                  @click="toggleStatus('montessori', 'incomplete')"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm uppercase tracking-[0.18em] text-(--ui-text-muted)">
                        Incomplete
                      </p>
                      <p class="mt-1 text-3xl font-semibold text-(--ui-text-highlighted)">
                        {{ incompleteCount }}
                      </p>
                    </div>

                    <div class="flex h-11 w-11 items-center justify-center rounded-full bg-(--ui-warning)/15 text-(--ui-warning)">
                      <UIcon name="i-lucide-hourglass" class="size-6" />
                    </div>
                  </div>
                  <p class="mt-3 text-sm text-(--ui-text-muted)">
                    {{ (100 - completedPercent).toFixed(1) }}% still need review completion.
                  </p>
                </button>
              </div>
            </div>
          </UPageCard>

          <UPageCard title="Exam Completion Reviews" variant="outline">
            <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex justify-center lg:flex-1">
                <button
                  type="button"
                  class="relative flex h-64 w-64 items-center justify-center rounded-full border border-(--ui-border) transition-transform hover:scale-[1.01]"
                  :style="examChartStyle"
                  @click="toggleStatus('exam', 'complete')"
                >
                  <div class="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-(--ui-bg) text-center shadow-sm ring-1 ring-(--ui-border)">
                    <span class="text-4xl font-semibold text-(--ui-text-highlighted)">
                      {{ examCompletedPercent.toFixed(0) }}%
                    </span>
                    <span class="mt-2 text-sm text-(--ui-text-muted)">
                      {{ examCompletedCount }} of {{ examTotalReviews }} complete
                    </span>
                  </div>
                </button>
              </div>

              <div class="flex flex-1 flex-col gap-3">
                <button
                  type="button"
                  class="rounded-xl border p-4 text-left transition-colors"
                  :class="selectedChart === 'exam' && selectedStatus === 'complete' ? 'border-(--ui-success) bg-(--ui-success)/10' : 'border-(--ui-border) hover:bg-(--ui-bg-elevated)/40'"
                  @click="toggleStatus('exam', 'complete')"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm uppercase tracking-[0.18em] text-(--ui-text-muted)">
                        Complete
                      </p>
                      <p class="mt-1 text-3xl font-semibold text-(--ui-text-highlighted)">
                        {{ examCompletedCount }}
                      </p>
                    </div>

                    <div class="flex h-11 w-11 items-center justify-center rounded-full bg-(--ui-success)/15 text-(--ui-success)">
                      <UIcon name="i-lucide-circle-check-big" class="size-6" />
                    </div>
                  </div>
                  <p class="mt-3 text-sm text-(--ui-text-muted)">
                    {{ examCompletedPercent.toFixed(1) }}% of exam reviews are completed.
                  </p>
                </button>

                <button
                  type="button"
                  class="rounded-xl border p-4 text-left transition-colors"
                  :class="selectedChart === 'exam' && selectedStatus === 'incomplete' ? 'border-(--ui-warning) bg-(--ui-warning)/10' : 'border-(--ui-border) hover:bg-(--ui-bg-elevated)/40'"
                  @click="toggleStatus('exam', 'incomplete')"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm uppercase tracking-[0.18em] text-(--ui-text-muted)">
                        Incomplete
                      </p>
                      <p class="mt-1 text-3xl font-semibold text-(--ui-text-highlighted)">
                        {{ examIncompleteCount }}
                      </p>
                    </div>

                    <div class="flex h-11 w-11 items-center justify-center rounded-full bg-(--ui-warning)/15 text-(--ui-warning)">
                      <UIcon name="i-lucide-hourglass" class="size-6" />
                    </div>
                  </div>
                  <p class="mt-3 text-sm text-(--ui-text-muted)">
                    {{ (100 - examCompletedPercent).toFixed(1) }}% still need exam completion.
                  </p>
                </button>
              </div>
            </div>
          </UPageCard>
        </div>

        <UPageCard
          v-if="selectedStatus"
          :title="selectionLabel"
          :description="selectionDescription"
          variant="outline"
          class="mt-4"
        >
          <UTable
            v-if="selectedChart === 'exam'"
            :data="selectedExamRows"
            :columns="examColumns"
            :ui="{
              base: 'table-fixed border-separate border-spacing-0',
              thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
              tbody: '[&>tr]:last:[&>td]:border-b-0',
              th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
              td: 'border-b border-(--ui-border) py-3 align-top'
            }"
          />

          <UTable
            v-else
            :data="selectedReviewRows"
            :columns="reviewColumns"
            :ui="{
              base: 'table-fixed border-separate border-spacing-0',
              thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
              tbody: '[&>tr]:last:[&>td]:border-b-0',
              th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
              td: 'border-b border-(--ui-border) py-3 align-top'
            }"
          />

          <div class="mt-4 flex items-center justify-between gap-3 text-sm text-(--ui-text-muted)">
            <span>
              Showing {{ selectedCount }} {{ selectedStatus }} review{{ selectedCount === 1 ? '' : 's' }}.
            </span>

            <UButton
              label="Close"
              color="neutral"
              variant="ghost"
              @click="selectedStatus = null"
            />
          </div>
        </UPageCard>
      </template>
    </template>
  </UDashboardPanel>
</template>
