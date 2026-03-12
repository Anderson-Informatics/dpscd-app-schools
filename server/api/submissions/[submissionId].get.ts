import SubmissionModel from '~~/server/models/submission.model'
import ResultModel from '~~/server/models/result.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'
import { getScopedUser, SCHOOL_ADMIN_VISIBLE_LISTS } from '~~/server/utils/userScope'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.submissionId
  const year = getYearFromEvent(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Submission id is required'
    })
  }

  const scopedUser = await getScopedUser(event)

  if (scopedUser.role === 'school admin') {
    if (typeof scopedUser.schoolId !== 'number') {
      throw createError({
        statusCode: 403,
        statusMessage: 'School is not assigned for this school admin user'
      })
    }

    const allowed = await ResultModel.findOne(
      withYearFilter(year, {
        submissionId: id,
        SchoolID: scopedUser.schoolId,
        lotteryList: { $in: SCHOOL_ADMIN_VISIBLE_LISTS }
      })
    )

    if (!allowed) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You are not allowed to access this submission'
      })
    }
  }

  const submission = await SubmissionModel.findOne(withYearFilter(year, { submissionId: id }))

  return submission
})
