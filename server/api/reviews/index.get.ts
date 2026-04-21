import ReviewModel from '~~/server/models/review.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  const year = getYearFromEvent(event)
  const reviews = await ReviewModel.find(withYearFilter(year))

  return reviews
})
