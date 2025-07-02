<script setup lang="ts">
import type { Qualification } from '~~/types/qualification';
import * as z from 'zod'


//const submissions = useSubmissions();
const route = useRoute();
// this is where we add the auth middleware to the page
//definePageMeta({
//  middleware: ["auth"],
//});
// Use the route param (submissionId) to select a single submission\
// Get the submission data from the Pinia store

// Load all of the key placement change functions/refs from composable
const actions = useActions()

const submissionStore = useSubmissionStore();
await useAsyncData(
  "submission",
  () => submissionStore.getOne(route.params.submissionId as string),
  {}
);

const resultStore = useResultStore();
await useAsyncData("results", () => resultStore.getAll(), {});
await useAsyncData("capacity", () => resultStore.getCapacity(), {})


const { data } = await useFetch<Qualification[]>(`/api/qualifications/${route.params.submissionId}`);

if (data.value) {
  data.value = data.value.map((qualification) => {
    return {
      ...qualification,
      label: qualification.School == 'Foreign Language Immersion and Cultural Studies School' ? 'FLICS' :
        qualification.School == 'Palmer Park Preparatory Academy' ? 'Palmer' :
          qualification.School == 'Chrysler Elementary' ? 'Chrysler' :
            qualification.School == 'Edmonson Elementary' ? 'Edmonson' :
              qualification.School == 'Edison Elementary' ? 'Edison' :
                qualification.School == 'Bates Academy' ? 'Bates' :
                  qualification.School == 'The School at Marygrove' ? 'Marygrove' : qualification.School,
      ChoiceRank: qualification.ChoiceRank ?? "Not Selected",
    };
  });
}

const eligible = [
  "Eligible for Edison Placement - Exam score",
  "Eligible for exam school placement - Appeal exam score meets requirements",
  "Eligible for exam school placement - Appeal review accepted",
  "Eligible for exam school placement - Exam score meets requirements",
  "Eligible for Marygrove Placement",
  "Eligible for Montessori Placement",
  "Eligible for Montessori Placement - Experience demonstrated"
];

const schema = z.object({
  notes: z.string(),
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  notes: '',
})

// Helpers for the edit modal component
const formValues = ref<Qualification>({
  _id: '',
  SchoolID: 0,
  School: '',
  EligibilityStatus: '',
  AgeEligible: false,
  ExamScore: 0,
  ExamScoreType: '',
  QualifyingScore: 0,
  submissionId: '',
  GradeEntering: '',
  FullName: '',
  ChoiceRank: 0,
  GradeAvailable: false,
  submissionIdInt: '',
  Round: '',
  AgeExemption: 0,
  notes: '',
  actionLong: '',
  ExamTaken: false,
  ExamScoreSort: 0,
  Qualified: false,
  Eligible: false
})

// This will reset the edit modal component
const loadItem = (val: Qualification) => {
  console.log("loadItem: ", val)
  formValues.value = val
  actions.showModal.value = true
  // These are the empty starting defaults for the form
  actions.pendingChanges.value = []
  actions.pendingStatus.value = false
  actions.buttonText.value = "Check"
  actions.buttonDisabled.value = false
  actions.pendingIds.value = []
  actions.pendingLog.value = []
}
</script>

<template>
  <UDashboardPanel
    :id="Array.isArray($route.params.submissionId) ? $route.params.submissionId[0] : $route.params.submissionId">
    <template #header>
      <UDashboardNavbar :title="submissionStore.submission.FullName">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>

      <UModal v-model:open="actions.showModal.value" title="Add New Placement Result"
        description="Add a new placement result for the selected student" :ui="{ footer: 'justify-end' }">
        <!--
          <UButton label="Open" color="neutral" variant="subtle" />
          -->

        <template #body>
          <UForm :schema="schema" :state="state">
            Perform the "{{ formValues.actionLong }}" action for {{ formValues.FullName }}
            at {{
            formValues.School }} for the {{ formValues.GradeEntering }} grade.<br /><br />
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
          <UButton :label="actions.buttonText.value" :disabled="actions.buttonDisabled.value" color="neutral"
            @click="actions.addResult({ ...formValues, stage: actions.buttonText.value }, submissionStore.submission)" />
        </template>
      </UModal>

      <div class="">
        <p>Grade: {{ submissionStore.submission.Grade }}</p>
        <p>DOB: {{ submissionStore.submission.DOB }}</p>
        <hr class="bg-gray-400 my-2 h-[2px] w-full" />
        <h2 class="font-bold text-xl mt-4">School Rankings</h2>

        <p>
          <span class="text-sm text-slate-500">First-Choice:</span>
          {{ submissionStore.submission.FirstChoiceSchool }}
        </p>
        <p>
          <span class="text-sm text-slate-500">Second-Choice:</span>
          {{ submissionStore.submission.SecondChoiceSchool }}
        </p>
        <p>
          <span class="text-sm text-slate-500">Third-Choice:</span>
          {{ submissionStore.submission.ThirdChoiceSchool }}
        </p>
        <hr class="bg-gray-400 my-2 h-[2px] w-full" />
        <h2 class="font-bold text-xl mt-4">Qualification and Eligibility</h2>
        <UTabs :items="data" orientation="horizontal"
          :ui="{ wrapper: 'flex items-center gap-4', list: { width: 'w-48' } }">
          <template #content="{ item }">

            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-bold">{{ item.School }}</h3>
              <p class="text-sm text-slate-500">Selection Rank: {{ item.ChoiceRank }}</p>
              <p class="text-sm text-slate-500">Status: {{ item.EligibilityStatus }}</p>
              <p class="text-sm text-slate-500">Age Eligible: {{ item.AgeEligible }}</p>
              <div v-if="[2882, 689, 7326].includes(item.SchoolID)" class="flex flex-col gap-2">
                <p class="text-sm text-slate-500">Exam Score: {{ item.ExamScore }}</p>
                <p class="text-sm text-slate-500">Exam Type: {{ item.ExamScoreType }}</p>
                <p class="text-sm text-slate-500">Qualifying Score: {{ item.QualifyingScore }}</p>
              </div>
              <div v-if="[1084].includes(item.SchoolID) && ['2', '3'].includes(item.GradeEntering)"
                class="flex flex-col gap-2">
                <p class="text-sm text-slate-500">Exam Score: {{ item.ExamScore }}</p>
                <p class="text-sm text-slate-500">Exam Type: {{ item.ExamScoreType }}</p>
                <p class="text-sm text-slate-500">Qualifying Score: {{ item.QualifyingScore }}</p>
              </div>
            </div>
            <div v-if="eligible.includes(item.EligibilityStatus) && ![0, 1, 2, 3].includes(item.ChoiceRank)">
              <UButton class="mt-2" label="Add to placement results"
                @click="loadItem({ ...item, actionLong: 'Add Placement Result' } as Qualification)" />
            </div>

          </template>
        </UTabs>

      </div>
    </template>
  </UDashboardPanel>

</template>