import type { H3Event } from 'h3'
import { getQuery } from 'h3'

export const DEFAULT_APP_YEAR = '2026'

type BodyWithYear = {
  year?: unknown
}

export const getYearFromEvent = (
  event: H3Event,
  body?: BodyWithYear
): string => {
  const queryYear = getQuery(event).year

  if (typeof queryYear === 'string' && queryYear.trim()) {
    return queryYear
  }

  if (
    Array.isArray(queryYear) &&
    typeof queryYear[0] === 'string' &&
    queryYear[0].trim()
  ) {
    return queryYear[0]
  }

  if (typeof body?.year === 'string' && body.year.trim()) {
    return body.year
  }

  return DEFAULT_APP_YEAR
}

export const withYearFilter = (
  year: string,
  filter: Record<string, unknown> = {}
) => ({
  ...filter,
  year
})
