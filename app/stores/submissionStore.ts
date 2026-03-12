import { defineStore } from 'pinia'
import type { Submission } from '~~/types/submission'

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error)
}

export const useSubmissionStore = defineStore('submission-store', {
  state: () => ({
    // list all results
    submissions: [] as Submission[],
    submission: {} as Submission
  }),
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
        const data = await $fetch<Submission[]>('/api/submissions', {
          query: this.getScopedQuery()
        })
        this.submissions = data
        return data
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
      }
    },
    async getOne(submissionId: string) {
      try {
        const data = await $fetch<Submission>(`/api/submissions/${submissionId}`, {
          query: this.getScopedQuery()
        })
        this.submission = data
        return data
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
      }
    }
  }
})
