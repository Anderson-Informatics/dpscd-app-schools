<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Review } from '~~/types/review'

type ReviewStatusFilter = 'complete' | 'incomplete' | null

const UBadge = resolveComponent('UBadge')
const { withYearQuery } = useAppYear()

const { data, status, error, refresh } = await useFetch<Review[]>('/api/reviews', {
  query: computed(() => withYearQuery()),
  default: () => []
})

const reviewType = 'Montessori/Marygrove Review'
const selectedStatus = ref<ReviewStatusFilter>(null)

const reviews = computed(() =>
  (data.value ?? []).filter((review) => review.ReviewType === reviewType)
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

const selectedRows = computed(() => {
  if (selectedStatus.value === 'complete') {
    return completedReviews.value
  }

  if (selectedStatus.value === 'incomplete') {
    return incompleteReviews.value
  }

  return []
})

const selectionLabel = computed(() => {
  if (selectedStatus.value === 'complete') {
    return 'Completed Reviews'
  }

  if (selectedStatus.value === 'incomplete') {
    return 'Incomplete Reviews'
  }

  return 'Review Details'
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

const toggleStatus = (nextStatus: Exclude<ReviewStatusFilter, null>) => {
  selectedStatus.value = selectedStatus.value === nextStatus ? null : nextStatus
}

const columns: TableColumn<Review>[] = [
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
</script>

<template>
  <UDashboardPanel id="reviews">
    <template #header>
      <UDashboardNavbar title="Reviews" :ui="{ right: 'gap-2' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <ActiveYearBadge />
          <UButton
            icon="i-lucide-refresh-cw"
            label="Refresh"
            color="neutral"
            variant="ghost"
            :loading="status === 'pending'"
            @click="refresh()"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageCard
        title="Montessori/Marygrove Review Completion"
        description="Completion dashboard for the Montessori/Marygrove review workflow in the selected year."
        variant="subtle"
      >
        <template v-if="error">
          <p class="text-error">
            Unable to load reviews: {{ error.message }}
          </p>
        </template>

        <template v-else>
          <p class="mb-4 text-sm text-(--ui-text-muted)">
            {{ status === 'pending' ? 'Loading review completion data...' : `${totalReviews} Montessori/Marygrove review records loaded.` }}
          </p>

          <UPageGrid class="gap-4">
            <UPageCard title="Completion Breakdown" variant="outline">
              <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div class="flex justify-center lg:flex-1">
                  <button
                    type="button"
                    class="relative flex h-64 w-64 items-center justify-center rounded-full border border-(--ui-border) transition-transform hover:scale-[1.01]"
                    :style="chartStyle"
                    @click="toggleStatus('complete')"
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
                    :class="selectedStatus === 'complete' ? 'border-(--ui-success) bg-(--ui-success)/10' : 'border-(--ui-border) hover:bg-(--ui-bg-elevated)/40'"
                    @click="toggleStatus('complete')"
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
                    :class="selectedStatus === 'incomplete' ? 'border-(--ui-warning) bg-(--ui-warning)/10' : 'border-(--ui-border) hover:bg-(--ui-bg-elevated)/40'"
                    @click="toggleStatus('incomplete')"
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
          </UPageGrid>

          <UPageCard
            v-if="selectedStatus"
            :title="selectionLabel"
            :description="`Condensed review list for ${selectedStatus} Montessori/Marygrove reviews.`"
            variant="outline"
            class="mt-4"
          >
            <UTable
              :data="selectedRows"
              :columns="columns"
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
                Showing {{ selectedRows.length }} {{ selectedStatus }} review{{ selectedRows.length === 1 ? '' : 's' }}.
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
      </UPageCard>
    </template>
  </UDashboardPanel>
</template>
