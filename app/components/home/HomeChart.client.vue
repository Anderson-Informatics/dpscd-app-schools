<script setup lang="ts">
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  endOfDay,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek
} from 'date-fns'
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from '@unovis/vue'
import type { Period, Range } from '~/types'
import type { Submission } from '~~/types/submission'

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')

const props = defineProps<{
  period: Period
  range: Range
}>()

type DataRecord = {
  date: Date
  count: number
}

const { width } = useElementSize(cardRef)
const { year, withYearQuery } = useAppYear()
const submissionsEndpoint = '/api/submissions' as string
const fetchSubmissions = $fetch as unknown as (
  input: string,
  init?: {
    query?: Record<string, string>
  }
) => Promise<Submission[]>

const { data: submissions } = await useAsyncData<Submission[]>(async () => {
  return fetchSubmissions(submissionsEndpoint, {
    query: withYearQuery() as Record<string, string>
  })
}, {
  watch: [year],
  default: () => []
})

const data = computed<DataRecord[]>(() => {
  const dates = ({
    daily: eachDayOfInterval,
    weekly: eachWeekOfInterval,
    monthly: eachMonthOfInterval
  } as Record<Period, typeof eachDayOfInterval>)[props.period](props.range)

  const bucketKey = (date: Date) => {
    if (props.period === 'monthly') {
      return startOfMonth(date).toISOString()
    }

    if (props.period === 'weekly') {
      return startOfWeek(date).toISOString()
    }

    return startOfDay(date).toISOString()
  }

  const counts = new Map<string, number>(dates.map((date) => [bucketKey(date), 0]))
  const interval = {
    start: startOfDay(props.range.start),
    end: endOfDay(props.range.end)
  }

  for (const submission of submissions.value) {
    const submittedAt = new Date(submission.submissionDate)
    if (Number.isNaN(submittedAt.getTime())) {
      continue
    }

    if (!isWithinInterval(submittedAt, interval)) {
      continue
    }

    const key = bucketKey(submittedAt)
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  return dates.map((date) => ({
    date,
    count: counts.get(bucketKey(date)) ?? 0
  }))
})

const x = (_: DataRecord, i: number) => i
const y = (d: DataRecord) => d.count

const total = computed(() => data.value.reduce((acc: number, { count }) => acc + count, 0))

const formatNumber = new Intl.NumberFormat('en').format

const formatDate = (date: Date): string => {
  return ({
    daily: format(date, 'd MMM'),
    weekly: format(date, 'd MMM'),
    monthly: format(date, 'MMM yyy')
  })[props.period]
}

const xTicks = (i: number) => {
  if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
    return ''
  }

  return formatDate(data.value[i].date)
}

const template = (d: DataRecord) => `${formatDate(d.date)}: ${formatNumber(d.count)} submissions`
</script>

<template>
  <UCard ref="cardRef" :ui="{ body: '!px-0 !pt-0 !pb-3' }">
    <template #header>
      <div>
        <p class="text-xs text-(--ui-text-muted) uppercase mb-1.5">
          Submissions
        </p>
        <p class="text-3xl text-(--ui-text-highlighted) font-semibold">
          {{ formatNumber(total) }}
        </p>
      </div>
    </template>

    <VisXYContainer
      :data="data"
      :padding="{ top: 40 }"
      class="h-96"
      :width="width"
    >
      <VisLine
        :x="x"
        :y="y"
        color="var(--ui-primary)"
      />
      <VisArea
        :x="x"
        :y="y"
        color="var(--ui-primary)"
        :opacity="0.1"
      />

      <VisAxis
        type="x"
        :x="x"
        :tick-format="xTicks"
      />

      <VisCrosshair
        color="var(--ui-primary)"
        :template="template"
      />

      <VisTooltip />
    </VisXYContainer>
  </UCard>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: var(--ui-bg);

  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);

  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>
