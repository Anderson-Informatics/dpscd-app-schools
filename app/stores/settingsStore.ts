import { defineStore } from 'pinia'
import type { Setting } from '~/types'

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error)
}

export const useSettingsStore = defineStore('settings-store', {
  state: () => ({
    // list all results
    settings: {} as Setting
  }),
  actions: {
    // Get all results from DB
    async getSettings() {
      try {
        const { withYearQuery } = useAppYear()
        const data = await $fetch<Setting>('/api/settings', {
          query: withYearQuery()
        })
        this.settings = data
        return data
      } catch (e: unknown) {
        console.log(getErrorMessage(e))
      }
    }
  }
})
