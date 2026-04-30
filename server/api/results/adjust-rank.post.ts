import ResultModel from '~~/server/models/result.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  // Get data form body
  const body = await readBody(event)
  const year = getYearFromEvent(event, body)

  // const filtered = await ResultModel.find({_id: {$in: body.ids});
  try {
    const filtered = await ResultModel.updateMany(
      withYearFilter(year, { _id: { $in: body.ids } }),
      { $inc: { adjustedRank: -1 } }
    )
    return filtered
  } catch (e: unknown) {
    throw createError({
      message: e instanceof Error ? e.message : 'Unable to adjust rank'
    })
  }
})
