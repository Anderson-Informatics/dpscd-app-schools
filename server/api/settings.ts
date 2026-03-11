import SettingModel from '~~/server/models/setting.model'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  const year = getYearFromEvent(event)
  const results = await SettingModel.find(withYearFilter(year))

  return results[0]
})
