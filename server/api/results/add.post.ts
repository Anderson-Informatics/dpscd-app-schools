import ResultModel from '~~/server/models/result.model'
import { getYearFromEvent } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody(event)
  const year = getYearFromEvent(event, body)
  console.log(body)

  // Update a result
  try {
    await ResultModel.insertOne({ ...body, year })
    return { message: 'Lottery placement result added' }
  } catch (e: any) {
    throw createError({
      message: e.message
    })
  }
})
