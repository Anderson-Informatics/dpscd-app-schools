import { defineStore } from "pinia";
import type { Change } from "~~/types/change";

export const useChangeStore = defineStore("change-store", {
  state: () => ({
    // list all results
    changes: [] as Change[],
  }),
  actions: {
    // Get all results from DB
    async getAll() {
      try {
        let data = await $fetch<Change[]>("/api/changes");
        this.changes = data;
        return data;
      } catch (e: any) {
        console.log(e.message);
      }
    },
    async addChange(body: Change) {
      try {
        // Maybe I can figure out how to fix this full URL in the long term?
        let response = await $fetch("/api/changes/add", {
          method: "POST",
          body: body,
        });
        console.log(response);
        return response;
      } catch (e: any) {
        console.log(e.message);
      }
    },
  },
});
