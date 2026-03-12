import ResultModel from '~~/server/models/result.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'
import { getScopedUser, SCHOOL_ADMIN_VISIBLE_LISTS } from '~~/server/utils/userScope'

export default defineEventHandler(async (event) => {
  const year = getYearFromEvent(event)
  const scopedUser = await getScopedUser(event)

  const filter =
    scopedUser.role === 'school admin' && typeof scopedUser.schoolId === 'number'
      ? withYearFilter(year, {
          SchoolID: scopedUser.schoolId,
          lotteryList: { $in: SCHOOL_ADMIN_VISIBLE_LISTS }
        })
      : withYearFilter(year)

  const results = await ResultModel.find(filter)

  return results
})
