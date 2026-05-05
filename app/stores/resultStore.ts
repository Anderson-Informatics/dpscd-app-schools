import { defineStore } from 'pinia'
import type { Result } from '~~/types/result'
import type { School, SchoolGrade } from '~~/types/school'

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error)
}

export const useResultStore = defineStore('result-store', {
  state: () => ({
    // list all results
    results: [] as Result[],
    schools: [] as School[],
    capacity: [] as SchoolGrade[],
    pendingOffers: [] as Result[]
  }),
  getters: {
    schoolCapacity: (state) => state.schools
  },
  actions: {
    getScopedQuery() {
      const { withYearQuery } = useAppYear()
      const query = withYearQuery() as Record<string, string>
      const userStore = useAppUser()

      if (userStore.value.user.email) {
        query.userEmail = userStore.value.user.email
      }

      return query
    },
    // Get all results from DB
    async getAll() {
      try {
        const data = await $fetch<Result[]>('/api/results', {
          query: this.getScopedQuery()
        })
        this.results = data
        return data
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
    },
    async getPending() {
      try {
        const data = await $fetch<Result[]>('/api/results/pending', {
          query: this.getScopedQuery()
        })
        this.pendingOffers = data
        return data
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
    },
    async getSchools() {
      try {
        const { withYearQuery } = useAppYear()
        const data = await $fetch<School[]>('/api/schools', {
          query: withYearQuery()
        })
        this.schools = data
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
    },
    async getCapacity() {
      try {
        const { withYearQuery } = useAppYear()
        const data = await $fetch('/api/schools/capacity', {
          query: withYearQuery()
        })
        this.capacity = data
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
    },
    async updateCapacity(school: SchoolGrade) {
      try {
        const { withYearBody } = useAppYear()
        const response = await $fetch(`/api/schools/capacity/update`, {
          method: 'POST',
          body: withYearBody({ ...school })
        })
        console.log(response)
        return response
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
      console.log(school)
    },
    async updateResult(result: Result) {
      try {
        const { withYearBody } = useAppYear()
        const userStore = useAppUser()
        const response = await $fetch<Result>(`/api/results/${result._id}`, {
          method: 'POST',
          body: withYearBody({
            ...(result.update || {}),
            userEmail: userStore.value.user.email
          })
        })
        console.log(response)
        return response
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
      console.log(result)
    },
    async insertResult(result: Result) {
      try {
        const { withYearBody } = useAppYear()
        const response = await $fetch('/api/results/add', {
          method: 'POST',
          body: withYearBody({ ...result })
        })
        console.log(response)
        return response
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
    },
    async adjustRankings(ids: string[]) {
      try {
        const { withYearBody } = useAppYear()
        const response = await $fetch('/api/results/adjust-rank', {
          method: 'POST',
          body: withYearBody({
            ids: ids
          })
        })
        console.log(response)
        return response
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
      console.log(ids)
    },
    async addLabel(result: Result, type: string) {
      try {
        const { withYearBody } = useAppYear()
        const response = await $fetch('/api/submittable/add', {
          method: 'POST',
          body: withYearBody({ ...result, type: type })
        })
        console.log(response)
        return response
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
    },
    async deleteLabel(result: Result, type: string) {
      try {
        const { withYearBody } = useAppYear()
        const response = await $fetch('/api/submittable/delete', {
          method: 'POST',
          body: withYearBody({ ...result, type: type })
        })
        console.log(response)
        return response
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
    }
  }
})
