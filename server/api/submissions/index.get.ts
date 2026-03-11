import type { H3Event } from 'h3'
import SubmissionModel from '~~/server/models/submission.model'
import ResultModel from '~~/server/models/result.model'
import type { Result } from '~~/types/result'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'
import { getScopedUser, SCHOOL_ADMIN_VISIBLE_LISTS } from '~~/server/utils/userScope'

export default defineEventHandler(async (event: H3Event) => {
  const year = getYearFromEvent(event)
  const scopedUser = await getScopedUser(event)
  const resultFilter =
    scopedUser.role === 'school admin' && typeof scopedUser.schoolId === 'number'
      ? withYearFilter(year, {
          SchoolID: scopedUser.schoolId,
          lotteryList: { $in: SCHOOL_ADMIN_VISIBLE_LISTS }
        })
      : withYearFilter(year)

  const results = (await ResultModel.find(resultFilter, {
    _id: 1,
    submissionId: 1,
    rank: 1,
    Grade: 1,
    SchoolID: 1,
    ChoiceRank: 1,
    School: 1,
    lotteryList: 1,
    adjustedRank: 1,
    confirmedEnrollment: 1,
    queueStatus: 1
  })
    .sort({ ChoiceRank: 1 })
    .lean()) as unknown as Result[]

  const submissionIds = [...new Set(results.map((result) => result.submissionId))]
  const data =
    scopedUser.role === 'school admin'
      ? await SubmissionModel.find(
          withYearFilter(year, { submissionId: { $in: submissionIds } })
        ).lean()
      : await SubmissionModel.find(withYearFilter(year)).lean()

  const topPlacement = (results: Result[]) => {
    const offer = results.filter((each) => each.lotteryList === 'Offered List')[0]
    const wait = results.filter((each) => each.lotteryList === 'Waiting List')[0]
    const sec = results.filter((each) => each.lotteryList === 'Secondary Waitlist')[0]
    const decline = results.filter((each) => each.lotteryList === 'Forfeited')[0]

    if (offer) {
      if (offer.confirmedEnrollment) {
        return { ...offer, status: 'Enrolled' }
      } else {
        return { ...offer, status: 'Offered' }
      }
    } else if (wait) {
      return { ...wait, status: 'Waitlisted' }
    } else if (sec) {
      return { ...sec, status: 'Secondary Waitlist' }
    } else if (decline) {
      return { ...decline, status: 'Forfeited' }
    } else {
      return {
        _id: '',
        submissionId: '',
        rank: 0,
        Grade: '',
        SchoolID: 0,
        School: 'None',
        ChoiceRank: 0,
        lotteryList: 'None',
        adjustedRank: 0,
        status: 'No Placement'
      }
    }
  }

  const combined = data.map((item) => ({
    ...item,
    results: results.filter((each) => each.submissionId === item.submissionId),
    topPlacement: topPlacement(results.filter((each) => each.submissionId === item.submissionId))
  }))

  return combined
})
