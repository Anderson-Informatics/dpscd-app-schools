import SettingModel from '~~/server/models/setting.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'

type ChangeLogEntry = {
  submissionId: string
  change: string
}

type NoteBody = {
  log: ChangeLogEntry[]
  changes: string[]
  userName: string
  notes: string
  year?: string
}

export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody<NoteBody>(event)

  const year = getYearFromEvent(event, body)
  const settings = await SettingModel.findOne(withYearFilter(year))

  // Default behavior stays enabled unless explicitly disabled.
  if (settings?.applyNotes === false) {
    return {
      message: 'Submittable note sync disabled by settings',
      skipped: true
    }
  }

  // The submissionId based major change log
  const changeLog = body.log

  // Get the runtimeconfig SUBMITTABLE API KEY
  const SUBMITTABLE_API_KEY = useRuntimeConfig().SUBMITTABLE_API_KEY

  // Update a result
  try {
    const uniqueSubmissionIds = new Set(changeLog.map((change) => change.submissionId))

    for (const id of uniqueSubmissionIds) {
      const changes = changeLog.filter((change) => change.submissionId === id)
      const firstChange = changes[0]
      console.log('Changes', changes.length)
      // Get the result from the database
      // Construct a custom message for submittable
      let customMessage = ''
      if (changes.length === 1 && firstChange) {
        if (body.changes[0] === firstChange.change) {
          // Don't duplicte the triggering action if it the the same
          customMessage = `${body.userName} from management app:<br/>Note: ${body.notes}<br/>Movement: ${firstChange.change}`
        } else {
          // If the change is not the same, add the triggering action
          customMessage = `${body.userName} from management app:<br/>Trigger Action: ${firstChange.change}<br/>Note: ${body.notes}<br/>Movement: ${firstChange.change}`
        }
      } else if (changes.length > 1) {
        let changeText = ''
        for (const each of changes) {
          changeText += `${each.change}<br/>`
        }
        customMessage = `${body.userName} from management app:<br/>Note: ${body.notes}<br/>Movement: ${changeText}`
      }

      await $fetch(`https://submittable-api.submittable.com/v4/submissions/${id}/notes`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${SUBMITTABLE_API_KEY}`
        },
        body: {
          note: customMessage,
          noteVisibility: 'team'
        }
      })
    }
    return { message: 'New notes logged in Submittable' }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    throw createError({
      message
    })
  }
})
