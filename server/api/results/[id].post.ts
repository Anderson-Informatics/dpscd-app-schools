import ResultModel from '~~/server/models/result.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'
import { getScopedUser, SCHOOL_ADMIN_VISIBLE_LISTS } from '~~/server/utils/userScope'

export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody<Record<string, unknown>>(event)
  const year = getYearFromEvent(event, body)
  const { userEmail, year: _bodyYear, ...updateFields } = body
  const id = event.context.params?.id
  if (!id) {
    throw createError({
      message: 'ID parameter is missing'
    })
  }

  const scopedUser = await getScopedUser(
    event,
    typeof userEmail === 'string' ? userEmail : undefined
  )

  if (scopedUser.role === 'school admin') {
    if (typeof scopedUser.schoolId !== 'number') {
      throw createError({
        statusCode: 403,
        statusMessage: 'School is not assigned for this school admin user'
      })
    }

    const isConfirmEnrollmentOnly =
      Object.keys(updateFields).length === 1 &&
      typeof updateFields.confirmedEnrollment === 'boolean'

    if (!isConfirmEnrollmentOnly) {
      throw createError({
        statusCode: 403,
        statusMessage: 'School admins can only update enrollment confirmation status'
      })
    }

    const allowedResult = await ResultModel.findOne(
      withYearFilter(year, {
        _id: id,
        SchoolID: scopedUser.schoolId,
        lotteryList: { $in: SCHOOL_ADMIN_VISIBLE_LISTS }
      })
    )

    if (!allowedResult) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You are not allowed to update this result'
      })
    }
  }

  // Update a result
  try {
    await ResultModel.updateOne(withYearFilter(year, { _id: id }), updateFields)
    return { message: 'Lottery placement result updated' }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    throw createError({
      message
    })
  }
})
