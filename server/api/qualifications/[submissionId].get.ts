import QualificationModel from '~~/server/models/qualification.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.submissionId
  const year = getYearFromEvent(event)
  const qualifications = await QualificationModel.find(
    withYearFilter(year, { submissionId: id })
  )

  return qualifications
})
