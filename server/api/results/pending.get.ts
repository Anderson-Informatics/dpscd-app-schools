import ResultModel from '~~/server/models/result.model'
import SubmissionModel from '~~/server/models/submission.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'
import { getScopedUser, SCHOOL_ADMIN_VISIBLE_LISTS } from '~~/server/utils/userScope'

export default defineEventHandler(async (event) => {
  const year = getYearFromEvent(event)
  const scopedUser = await getScopedUser(event)
  const scopedFilter =
    scopedUser.role === 'school admin' && typeof scopedUser.schoolId === 'number'
      ? {
          SchoolID: scopedUser.schoolId,
          lotteryList: { $in: SCHOOL_ADMIN_VISIBLE_LISTS }
        }
      : {}

  const data = await ResultModel.find(
    withYearFilter(year, { queueStatus: 'Offer Pending', ...scopedFilter })
  ).lean()
  const ids = data.map((a) => a.submissionId)
  const all = await ResultModel.find(
    withYearFilter(year, { submissionId: { $in: ids }, ...scopedFilter }),
    {
      _id: 1,
      submissionId: 1,
      ChoiceRank: 1,
      School: 1,
      lotteryList: 1,
      adjustedRank: 1,
      confirmedEnrollment: 1
    }
  ).sort({ ChoiceRank: 1 })
  const subm = await SubmissionModel.find(withYearFilter(year, { submissionId: { $in: ids } }), {
    _id: 0,
    submissionId: 1,
    ParentFirst: 1,
    ParentLast: 1,
    ParentPhone: 1,
    ParentEmail: 1
  })
  const combined = data.map((item) => ({
    ...item,
    contact: subm.filter((each) => each.submissionId === item.submissionId)[0],
    results: all.filter((each) => each.submissionId === item.submissionId)
  }))

  return combined
})
