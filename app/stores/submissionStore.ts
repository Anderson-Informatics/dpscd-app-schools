import { defineStore } from "pinia";
import type { Submission } from "~~/types/submission";

export const useSubmissionStore = defineStore("submission-store", {
  state: () => ({
    // list all results
    submissions: [] as Submission[],
    submission: {} as Submission,
  }),
  actions: {
    // Get all results from DB
    async getAll() {
      try {
        let data = await $fetch<Submission[]>("/api/submissions");
        this.submissions = data;
        return data;
      } catch (e: any) {
        console.log(e.message);
      }
    },
    async getOne(submissionId: string) {
      try {
        // Maybe I can figure out how to fix this full URL in the long term?
        let data = await $fetch<Submission>(`/api/submissions/${submissionId}`);
        this.submission = data;
        return data;
      } catch (e: any) {
        console.log(e.message);
      }
    },
  },
});
