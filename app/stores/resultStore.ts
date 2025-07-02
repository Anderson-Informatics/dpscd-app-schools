import { defineStore } from "pinia";
import type { Result } from "~~/types/result";
import type { School, SchoolGrade } from "~~/types/school";

export const useResultStore = defineStore("result-store", {
  state: () => ({
    // list all results
    results: [] as Result[],
    schools: [] as School[],
    capacity: [] as SchoolGrade[],
    pendingOffers: [] as Result[],
  }),
  getters: {
    schoolCapacity: (state) => state.schools,
  },
  actions: {
    // Get all results from DB
    async getAll() {
      try {
        let data = await $fetch<Result[]>("/api/results");
        this.results = data;
        return data;
      } catch (e: any) {
        console.log(e.message);
      }
    },
    async getPending() {
      try {
        let data = await $fetch<Result[]>("/api/results/pending");
        this.pendingOffers = data;
        return data;
      } catch (e: any) {
        console.log(e.message);
      }
    },
    async getSchools() {
      try {
        let data = await $fetch<School[]>("/api/schools");
        this.schools = data;
      } catch (e: any) {
        console.log(e.message);
      }
    },
    async getCapacity() {
      try {
        let data = await $fetch("/api/schools/capacity");
        this.capacity = data;
      } catch (e: any) {
        console.log(e.message);
      }
    },
    async updateCapacity(school: SchoolGrade) {
      try {
        let response = await $fetch(`/api/schools/capacity/update`, {
          method: "POST",
          body: school,
        });
        console.log(response);
      } catch (e: any) {
        console.log(e.message);
      }
      console.log(school);
    },
    async updateResult(result: Result) {
      try {
        let response = await $fetch<Result>(`/api/results/${result._id}`, {
          method: "POST",
          body: result.update,
        });
        console.log(response);
      } catch (e: any) {
        console.log(e.message);
      }
      console.log(result);
    },
    async insertResult(result: Result) {
      try {
        let response = await $fetch("/api/results/add", {
          method: "POST",
          body: result,
        });
        console.log(response);
      } catch (e: any) {
        console.log(e.message);
      }
    },
    async adjustRankings(ids: string[]) {
      try {
        let response = await $fetch("/api/results/adjust-rank", {
          method: "POST",
          body: {
            ids: ids,
          },
        });
        console.log(response);
      } catch (e: any) {
        console.log(e.message);
      }
      console.log(ids);
    },
    async addLabel(result: Result, type: String) {
      try {
        let response = await $fetch("/api/submittable/add", {
          method: "POST",
          body: { ...result, type: type },
        });
        console.log(response);
      } catch (e: any) {
        console.log(e.message);
      }
    },
    async deleteLabel(result: Result, type: String) {
      try {
        let response = await $fetch("/api/submittable/delete", {
          method: "POST",
          body: { ...result, type: type },
        });
        console.log(response);
      } catch (e: any) {
        console.log(e.message);
      }
    },
  },
});
