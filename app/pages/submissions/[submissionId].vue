<script setup>
import { contextMenu } from '#build/ui';
import { label } from '@unovis/ts/components/axis/style';

//const submissions = useSubmissions();
const route = useRoute();
// this is where we add the auth middleware to the page
//definePageMeta({
//  middleware: ["auth"],
//});
// Use the route param (submissionId) to select a single submission\
// Get the submission data from the Pinia store
const submissionStore = useSubmissionStore();
await useAsyncData(
  "submission",
  () => submissionStore.getOne(route.params.submissionId),
  {}
);

const { data } = await useFetch(`/api/qualifications/${route.params.submissionId}`);

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

//const {
//  data: submission,
//  pending,
//  error,
//} = await useFetch(
//  () => `http://localhost:3000/api/submissions/${route.params.submissionId}`
//);
//console.log(submission.value);
//const submission = computed(() => {
//  return submissions.find(
//    (submission) => submission.submissionId === route.params.submissionId
//  );
//});
// This will just throw a more palatable 404 error when submission id route not found
//if (!submissionStore.submission.value) {
//  throw createError({
//    statusCode: 404,
//    message: "Submission not found",
//  });
//}
//const title = computed(() => {
//  return `Submission - ${submission.FullName}`;
//});
//useHead({
//  title,
//});
</script>

<template>
  <div class="m-10 w-full">
    Submission Page {{ $route.params.submissionId }} <br />
    <h1 class="font-bold text-2xl">
      {{ submissionStore.submission.FullName }}
    </h1>
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
    <UTabs :items="data" orientation="horizontal" :ui="{ wrapper: 'flex items-center gap-4', list: { width: 'w-48' } }">
      <template #content="{ item }">

        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-bold">{{ item.School }}</h3>
          <p class="text-sm text-slate-500">Selection Rank: {{ item.ChoiceRank }}</p>
          <p class="text-sm text-slate-500">Status: {{ item.EligibilityStatus }}</p>
          <p class="text-sm text-slate-500">Age Eligible: {{ item.AgeEligible }}</p>
          <div v-if="[1084, 2882, 689, 7326].includes(item.SchoolID)" class="flex flex-col gap-2">
            <p class="text-sm text-slate-500">Exam Score: {{ item.ExamScore }}</p>
            <p class="text-sm text-slate-500">Exam Type: {{ item.ExamScoreType }}</p>
            <p class="text-sm text-slate-500">Qualifying Score: {{ item.QualifyingScore }}</p>
          </div>
        </div>
      </template>
    </UTabs>

  </div>

</template>
