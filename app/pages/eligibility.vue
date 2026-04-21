<script setup lang="ts">
import type { Qualification } from '~~/types/qualification'

type SummaryRow = {
  label: string
  count: number
  percent: number
}

type GroupSummary = {
  total: number
  uniqueSubmissions: number
  uniqueSchools: number
  eligibleCount: number
  ineligibleCount: number
  qualifiedCount: number
  notQualifiedCount: number
  eligibilityRate: number
  qualificationRate: number
  statusSummary: SummaryRow[]
  roundSummary: SummaryRow[]
  topSchools: SummaryRow[]
}

const { withYearQuery } = useAppYear()

const { data, status, error, refresh } = await useFetch<Qualification[]>('/api/qualifications', {
  query: computed(() => withYearQuery()),
  default: () => []
})

const allRows = computed(() => data.value ?? [])

const safeLabel = (value: string | null | undefined) => {
  if (!value || !value.trim()) {
    return 'Unknown'
  }
  return value.trim()
}

const isRankedChoice = (value: unknown) => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

const rankedRows = computed(() => allRows.value.filter((row) => isRankedChoice(row.ChoiceRank)))

const toSummaryRows = (labels: string[], denominator: number): SummaryRow[] => {
  const counts = labels.reduce<Record<string, number>>((acc, label) => {
    const key = safeLabel(label)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      percent: denominator > 0 ? (count / denominator) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
}

const average = (values: number[]) => {
  if (!values.length) {
    return 0
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const summarizeGroup = (rows: Qualification[]): GroupSummary => {
  const total = rows.length
  const eligibleCount = rows.filter((row) => row.Eligible === true).length
  const ineligibleCount = rows.filter((row) => row.Eligible === false).length
  const qualifiedCount = rows.filter((row) => row.Qualified === true).length
  const notQualifiedCount = rows.filter((row) => row.Qualified === false).length

  return {
    total,
    uniqueSubmissions: new Set(rows.map((row) => row.submissionId)).size,
    uniqueSchools: new Set(rows.map((row) => row.SchoolID)).size,
    eligibleCount,
    ineligibleCount,
    qualifiedCount,
    notQualifiedCount,
    eligibilityRate: total > 0 ? (eligibleCount / total) * 100 : 0,
    qualificationRate: total > 0 ? (qualifiedCount / total) * 100 : 0,
    statusSummary: toSummaryRows(rows.map((row) => row.EligibilityStatus), total),
    roundSummary: toSummaryRows(rows.map((row) => row.Round), total),
    topSchools: toSummaryRows(rows.map((row) => row.School), total).slice(0, 8)
  }
}

const EXAM_SCHOOL_IDS = [2882, 689, 7326]

const isMontessoriMarygroveRow = (row: Qualification) => {
  const school = safeLabel(row.School).toLowerCase()
  const statusText = safeLabel(row.EligibilityStatus).toLowerCase()
  return (
    school.includes('montessori') ||
    school.includes('marygrove') ||
    statusText.includes('montessori') ||
    statusText.includes('marygrove')
  )
}

const isExamRow = (row: Qualification) => {
  const statusText = safeLabel(row.EligibilityStatus).toLowerCase()
  return EXAM_SCHOOL_IDS.includes(row.SchoolID) || statusText.includes('exam')
}

const examRows = computed(() =>
  rankedRows.value.filter((row) => !isMontessoriMarygroveRow(row) && isExamRow(row))
)

const montessoriMarygroveRows = computed(() =>
  rankedRows.value.filter((row) => isMontessoriMarygroveRow(row))
)

const uncategorizedRows = computed(() =>
  rankedRows.value.filter((row) => !isMontessoriMarygroveRow(row) && !isExamRow(row))
)

const rankedSummary = computed(() => summarizeGroup(rankedRows.value))
const examSummary = computed(() => summarizeGroup(examRows.value))
const montessoriMarygroveSummary = computed(() => summarizeGroup(montessoriMarygroveRows.value))

const examScores = computed(() =>
  examRows.value
    .map((row) => row.ExamScore)
    .filter((score) => typeof score === 'number' && Number.isFinite(score))
)

const examQualifyingScores = computed(() =>
  examRows.value
    .map((row) => row.QualifyingScore)
    .filter((score) => typeof score === 'number' && Number.isFinite(score))
)

const examScoreGapRows = computed(() =>
  examRows.value.filter(
    (row) => Number.isFinite(row.ExamScore) && Number.isFinite(row.QualifyingScore)
  )
)

const examGroupMetrics = computed(() => {
  const metCutoffCount = examScoreGapRows.value.filter(
    (row) => row.ExamScore >= row.QualifyingScore
  ).length
  const scoreGaps = examScoreGapRows.value.map((row) => row.ExamScore - row.QualifyingScore)

  return {
    scoreCount: examScores.value.length,
    scoreAverage: average(examScores.value),
    scoreMin: examScores.value.length ? Math.min(...examScores.value) : 0,
    scoreMax: examScores.value.length ? Math.max(...examScores.value) : 0,
    cutoffCount: examQualifyingScores.value.length,
    cutoffAverage: average(examQualifyingScores.value),
    metCutoffCount,
    metCutoffRate: examScoreGapRows.value.length
      ? (metCutoffCount / examScoreGapRows.value.length) * 100
      : 0,
    averageScoreGap: average(scoreGaps),
    qualifiedDespiteBelowCutoff: examScoreGapRows.value.filter(
      (row) => row.ExamScore < row.QualifyingScore && row.Qualified === true
    ).length,
    notQualifiedDespiteCutoff: examScoreGapRows.value.filter(
      (row) => row.ExamScore >= row.QualifyingScore && row.Qualified === false
    ).length
  }
})

const montessoriMarygroveMetrics = computed(() => {
  const rows = montessoriMarygroveRows.value
  const ageEligibleCount = rows.filter((row) => row.AgeEligible === true).length
  const gradeAvailableCount = rows.filter((row) => row.GradeAvailable === true).length

  return {
    ageEligibleCount,
    ageEligibleRate: rows.length ? (ageEligibleCount / rows.length) * 100 : 0,
    gradeAvailableCount,
    gradeAvailableRate: rows.length ? (gradeAvailableCount / rows.length) * 100 : 0,
    experienceDemonstratedCount: rows.filter((row) =>
      safeLabel(row.EligibilityStatus).toLowerCase().includes('experience demonstrated')
    ).length
  }
})

const formatPercent = (value: number) => `${value.toFixed(1)}%`
const formatValue = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 2 })
</script>

<template>
  <UDashboardPanel id="eligibility">
    <template #header>
      <UDashboardNavbar title="Eligibility" :ui="{ right: 'gap-2' }">
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
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageCard
        title="Ranked Qualification Summary"
        description="Rows are filtered to ranked schools first, then split into Exam and Montessori/Marygrove groups for separate analysis."
        variant="subtle"
      >
        <template v-if="error">
          <p class="text-error">
            Unable to load qualifications: {{ error.message }}
          </p>
        </template>
        <template v-else>
          <p class="text-sm text-(--ui-text-muted) mb-4">
            {{ status === 'pending' ? 'Loading latest qualification data...' : 'Showing ranked-school qualification snapshot.' }}
          </p>

          <UPageGrid class="md:grid-cols-2 xl:grid-cols-5 gap-4">
            <UPageCard title="Total API Rows" variant="outline">
              <p class="text-2xl font-semibold">
                {{ formatValue(allRows.length) }}
              </p>
            </UPageCard>

            <UPageCard title="Ranked Rows" variant="outline">
              <p class="text-2xl font-semibold">
                {{ formatValue(rankedSummary.total) }}
              </p>
            </UPageCard>

            <UPageCard title="Unranked Excluded" variant="outline">
              <p class="text-2xl font-semibold">
                {{ formatValue(allRows.length - rankedSummary.total) }}
              </p>
            </UPageCard>

            <UPageCard title="Exam Group Rows" variant="outline">
              <p class="text-2xl font-semibold">
                {{ formatValue(examSummary.total) }}
              </p>
            </UPageCard>

            <UPageCard title="Montessori/Marygrove Rows" variant="outline">
              <p class="text-2xl font-semibold">
                {{ formatValue(montessoriMarygroveSummary.total) }}
              </p>
            </UPageCard>
          </UPageGrid>

          <UPageCard title="Exam Schools Summary" variant="outline" class="mt-4">
            <UPageGrid class="md:grid-cols-2 xl:grid-cols-3 gap-4">
              <UPageCard title="Core Outcomes" variant="soft">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>Total</span>
                    <span>{{ formatValue(examSummary.total) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Unique Submissions</span>
                    <span>{{ formatValue(examSummary.uniqueSubmissions) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Eligible Rate</span>
                    <span>{{ formatPercent(examSummary.eligibilityRate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Qualified Rate</span>
                    <span>{{ formatPercent(examSummary.qualificationRate) }}</span>
                  </div>
                </div>
              </UPageCard>

              <UPageCard title="Exam/Cutoff Metrics" variant="soft">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>Rows with Exam Score</span>
                    <span>{{ formatValue(examGroupMetrics.scoreCount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Avg Exam Score</span>
                    <span>{{ formatValue(examGroupMetrics.scoreAverage) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Min / Max Exam Score</span>
                    <span>{{ formatValue(examGroupMetrics.scoreMin) }} / {{ formatValue(examGroupMetrics.scoreMax) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Avg Qualifying Score</span>
                    <span>{{ formatValue(examGroupMetrics.cutoffAverage) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Met Cutoff Rate</span>
                    <span>{{ formatPercent(examGroupMetrics.metCutoffRate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Avg Score Gap (Exam - Cutoff)</span>
                    <span>{{ formatValue(examGroupMetrics.averageScoreGap) }}</span>
                  </div>
                </div>
              </UPageCard>

              <UPageCard title="Exam Consistency Checks" variant="soft">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>Qualified Despite Below Cutoff</span>
                    <span>{{ formatValue(examGroupMetrics.qualifiedDespiteBelowCutoff) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Not Qualified Despite Cutoff</span>
                    <span>{{ formatValue(examGroupMetrics.notQualifiedDespiteCutoff) }}</span>
                  </div>
                </div>
              </UPageCard>
            </UPageGrid>

            <UPageGrid class="md:grid-cols-2 gap-4 mt-4">
              <UPageCard title="Exam Eligibility Status Breakdown" variant="soft">
                <div class="space-y-2 text-sm">
                  <div
                    v-for="item in examSummary.statusSummary"
                    :key="`exam-status-${item.label}`"
                    class="flex justify-between"
                  >
                    <span>{{ item.label }}</span>
                    <span>{{ formatValue(item.count) }} ({{ item.percent.toFixed(1) }}%)</span>
                  </div>
                </div>
              </UPageCard>

              <UPageCard title="Exam Top Schools" variant="soft">
                <div class="space-y-2 text-sm">
                  <div
                    v-for="item in examSummary.topSchools"
                    :key="`exam-school-${item.label}`"
                    class="flex justify-between"
                  >
                    <span class="truncate pr-3">{{ item.label }}</span>
                    <span>{{ formatValue(item.count) }} ({{ item.percent.toFixed(1) }}%)</span>
                  </div>
                </div>
              </UPageCard>
            </UPageGrid>
          </UPageCard>

          <UPageCard title="Montessori/Marygrove Summary" variant="outline" class="mt-4">
            <UPageGrid class="md:grid-cols-2 xl:grid-cols-3 gap-4">
              <UPageCard title="Core Outcomes" variant="soft">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>Total</span>
                    <span>{{ formatValue(montessoriMarygroveSummary.total) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Unique Submissions</span>
                    <span>{{ formatValue(montessoriMarygroveSummary.uniqueSubmissions) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Eligible Rate</span>
                    <span>{{ formatPercent(montessoriMarygroveSummary.eligibilityRate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Qualified Rate</span>
                    <span>{{ formatPercent(montessoriMarygroveSummary.qualificationRate) }}</span>
                  </div>
                </div>
              </UPageCard>

              <UPageCard title="Program-Specific Checks" variant="soft">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>Age Eligible Rate</span>
                    <span>{{ formatPercent(montessoriMarygroveMetrics.ageEligibleRate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Grade Available Rate</span>
                    <span>{{ formatPercent(montessoriMarygroveMetrics.gradeAvailableRate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Experience Demonstrated Status</span>
                    <span>{{ formatValue(montessoriMarygroveMetrics.experienceDemonstratedCount) }}</span>
                  </div>
                </div>
              </UPageCard>

              <UPageCard title="Outcome Counts" variant="soft">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span>Eligible</span>
                    <span>{{ formatValue(montessoriMarygroveSummary.eligibleCount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Ineligible</span>
                    <span>{{ formatValue(montessoriMarygroveSummary.ineligibleCount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Qualified</span>
                    <span>{{ formatValue(montessoriMarygroveSummary.qualifiedCount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Not Qualified</span>
                    <span>{{ formatValue(montessoriMarygroveSummary.notQualifiedCount) }}</span>
                  </div>
                </div>
              </UPageCard>
            </UPageGrid>

            <UPageGrid class="md:grid-cols-2 gap-4 mt-4">
              <UPageCard title="Montessori/Marygrove Status Breakdown" variant="soft">
                <div class="space-y-2 text-sm">
                  <div
                    v-for="item in montessoriMarygroveSummary.statusSummary"
                    :key="`mm-status-${item.label}`"
                    class="flex justify-between"
                  >
                    <span>{{ item.label }}</span>
                    <span>{{ formatValue(item.count) }} ({{ item.percent.toFixed(1) }}%)</span>
                  </div>
                </div>
              </UPageCard>

              <UPageCard title="Montessori/Marygrove Top Schools" variant="soft">
                <div class="space-y-2 text-sm">
                  <div
                    v-for="item in montessoriMarygroveSummary.topSchools"
                    :key="`mm-school-${item.label}`"
                    class="flex justify-between"
                  >
                    <span class="truncate pr-3">{{ item.label }}</span>
                    <span>{{ formatValue(item.count) }} ({{ item.percent.toFixed(1) }}%)</span>
                  </div>
                </div>
              </UPageCard>
            </UPageGrid>

            <UPageCard title="Montessori/Marygrove Round Breakdown" variant="soft" class="mt-4">
              <div class="space-y-2 text-sm">
                <div
                  v-for="item in montessoriMarygroveSummary.roundSummary"
                  :key="`mm-round-${item.label}`"
                  class="flex justify-between"
                >
                  <span>{{ item.label }}</span>
                  <span>{{ formatValue(item.count) }} ({{ item.percent.toFixed(1) }}%)</span>
                </div>
              </div>
            </UPageCard>
          </UPageCard>

          <UPageCard title="Uncategorized Ranked Rows" variant="outline" class="mt-4">
            <p class="text-sm text-(--ui-text-muted)">
              Ranked rows that do not match Exam or Montessori/Marygrove grouping rules.
            </p>
            <p class="text-2xl font-semibold mt-2">
              {{ formatValue(uncategorizedRows.length) }}
            </p>
          </UPageCard>
        </template>
      </UPageCard>
    </template>
  </UDashboardPanel>
</template>
