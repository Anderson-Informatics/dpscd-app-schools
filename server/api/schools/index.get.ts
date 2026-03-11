import SchoolModel from '~~/server/models/school.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  const year = getYearFromEvent(event)
  const schools = await SchoolModel.find(withYearFilter(year))

  return schools
})
