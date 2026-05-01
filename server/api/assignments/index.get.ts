import AssignmentModel from '~~/server/models/assignment.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  const year = getYearFromEvent(event)
  const assignments = await AssignmentModel.find(withYearFilter(year)).lean()

  return assignments.map((assignment) => ({
    ...assignment,
    _id: assignment._id?.toString?.() ?? assignment._id
  }))
})
