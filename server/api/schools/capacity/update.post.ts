import SchoolModel from '~~/server/models/school.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody(event)
  const year = getYearFromEvent(event, body)
  console.log(body)

  // Update a result
  try {
    await SchoolModel.updateOne(
      withYearFilter(year, { SchoolID: body.SchoolID }),
      {
        $set: {
          [`Capacity.${body.Grade}`]: body.Capacity,
          year
        }
      }
    )
    return { message: 'Capacity updated' }
  } catch (e: any) {
    throw createError({
      message: e.message
    })
  }
})
