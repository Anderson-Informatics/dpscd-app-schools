import { defineStore } from 'pinia'
import type { Change } from '~~/types/change'

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error)
}

export const useChangeStore = defineStore('change-store', {
  state: () => ({
    // list all results
    changes: [] as Change[]
  }),
  actions: {
    // Get all results from DB
    async getAll() {
      try {
        const { withYearQuery } = useAppYear()
        const data = await $fetch<Change[]>('/api/changes', {
          query: withYearQuery()
        })
        this.changes = data
        return data
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
    },
    async addChange(body: Change) {
      try {
        const { withYearBody } = useAppYear()
        // Maybe I can figure out how to fix this full URL in the long term?
        const response = await $fetch('/api/changes/add', {
          method: 'POST',
          body: withYearBody({ ...body })
        })
        const resp2 = await $fetch('/api/submittable/note', {
          method: 'POST',
          body: withYearBody({ ...body })
        })
        console.log(response, resp2)
        return [response, resp2]
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
        throw e
      }
    }
  }
})
