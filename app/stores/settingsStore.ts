import { defineStore } from "pinia";
import type { Setting } from "~/types";

export const useSettingsStore = defineStore("settings-store", {
  state: () => ({
    // list all results
    settings: {} as Setting,
  }),
  actions: {
    // Get all results from DB
    async getSettings() {
      try {
        let data = await $fetch<Setting>("/api/settings");
        this.settings = data;
        return data;
      } catch (e: any) {
        console.log(e.message);
      }
    },
  },
});
