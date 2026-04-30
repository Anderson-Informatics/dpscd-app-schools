import { getQuery } from 'h3'
import ExamCompletionModel from '~~/server/models/exam-completion.model'
import { getYearFromEvent } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  const year = getYearFromEvent(event)
  const query = getQuery(event)
  const parsedYear = Number.parseInt(year, 10)
  const yearCandidates: Array<string | number> = Number.isFinite(parsedYear)
    ? [year, parsedYear]
    : [year]
  const filter: Record<string, unknown> = {
    year: {
      $in: yearCandidates
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
