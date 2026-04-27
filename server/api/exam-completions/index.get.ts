import type { FilterQuery } from 'mongoose'
import { getQuery } from 'h3'
import ExamCompletionModel from '~~/server/models/exam-completion.model'
import { getYearFromEvent } from '~~/server/utils/year'

type ExamCompletionDoc = {
  Round?: string
  GradeEntering?: string
  TestDate?: Date | string
}

export default defineEventHandler(async (event) => {
  const year = getYearFromEvent(event)
  const query = getQuery(event)
  const filter: FilterQuery<ExamCompletionDoc> = {}

  const yearNumber = Number.parseInt(year, 10)
  if (Number.isFinite(yearNumber)) {
    const start = new Date(Date.UTC(yearNumber, 0, 1))
    const end = new Date(Date.UTC(yearNumber + 1, 0, 1))

    filter.TestDate = {
      $gte: start,
      $lt: end
    }
  }

  if (typeof query.round === 'string' && query.round.trim()) {
    filter.Round = query.round.trim()
  }

  if (typeof query.grade === 'string' && query.grade.trim()) {
    filter.GradeEntering = query.grade.trim()
  }

  return ExamCompletionModel.find(filter)
})
