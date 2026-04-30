import mongoose from 'mongoose'
import ChangeModel from '~~/server/models/change.model'
import { getYearFromEvent } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  // Get data form body
  const body = await readBody(event)
  const year = getYearFromEvent(event, body)

  try {
    const response = await ChangeModel.create({
      _id: new mongoose.Types.ObjectId().toHexString(),
      ...body,
      year
    })
    return response
  } catch (e: unknown) {
    throw createError({
      message: e instanceof Error ? e.message : 'Unable to add change'
    })
  }
})
