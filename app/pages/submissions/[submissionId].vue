<script setup>
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
  <div class="m-10">
    Submission Page {{ $route.params.submissionId }} <br />
    <h1 class="font-bold text-2xl">
      {{ submissionStore.submission.FullName }}
    </h1>
    <p>DOB: {{ submissionStore.submission.DOB }}</p>

    <h2 class="font-bold text-xl mt-4">School Rankings</h2>
    <hr class="bg-gray-400 my-2 h-[2px]" />
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
  </div>
</template>
