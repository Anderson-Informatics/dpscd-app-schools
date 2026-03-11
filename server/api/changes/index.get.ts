import ChangeModel from '~~/server/models/change.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  const year = getYearFromEvent(event)
  const changes = await ChangeModel.find(withYearFilter(year))

  return changes
})
