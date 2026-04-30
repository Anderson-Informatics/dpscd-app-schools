import { computed, watch } from 'vue'
import { useCookie } from '#app'

type AppTeam = {
  label: string
  year: string
  avatar: {
    src: string
    alt: string
  }
}

const TEAM_ICON = '/favicon.ico'

const APP_TEAMS: AppTeam[] = [
  {
    label: '2026 Apps',
    year: '2026',
    avatar: {
      src: TEAM_ICON,
      alt: '2026 Apps'
    }
  },
  {
    label: '2025 Apps',
    year: '2025',
    avatar: {
      src: TEAM_ICON,
      alt: '2025 Apps'
    }
  }
]

const DEFAULT_APP_YEAR = '2026'

const normalizeYear = (value: unknown): string => {
  if (typeof value !== 'string') {
    return DEFAULT_APP_YEAR
  }

  const trimmed = value.trim()
  return APP_TEAMS.some((team) => team.year === trimmed) ? trimmed : DEFAULT_APP_YEAR
}

export function useAppYear() {
  const route = useRoute()
  const yearCookie = useCookie<string | undefined>('app-year', {
    default: () => undefined,
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    sameSite: 'lax',
    watch: true
  })

  const year = useState<string>('app-year-state', () => {
    const routeYear = route.query.year
    if (typeof routeYear === 'string') {
      return normalizeYear(routeYear)
    }
    if (Array.isArray(routeYear) && typeof routeYear[0] === 'string') {
      return normalizeYear(routeYear[0])
    }

    if (typeof yearCookie.value === 'string') {
      return normalizeYear(yearCookie.value)
    }
    return DEFAULT_APP_YEAR
  })

  // Initialize from cookie once if present; otherwise seed cookie from state.
  if (typeof yearCookie.value === 'string') {
    const normalizedCookieYear = normalizeYear(yearCookie.value)
    if (normalizedCookieYear !== year.value) {
      year.value = normalizedCookieYear
    }
  } else {
    yearCookie.value = normalizeYear(year.value)
  }

  // Keep cookie in sync with global state.
  watch(
    year,
    (nextYear) => {
      const normalizedNextYear = normalizeYear(nextYear)
      if (normalizedNextYear !== yearCookie.value) {
        yearCookie.value = normalizedNextYear
      }
      if (normalizedNextYear !== year.value) {
        year.value = normalizedNextYear
      }
    },
    { immediate: true }
  )

  // If cookie changes externally, sync state once.
  watch(yearCookie, (nextCookieYear) => {
    if (typeof nextCookieYear !== 'string') {
      return
    }

    const normalizedCookieYear = normalizeYear(nextCookieYear)
    if (normalizedCookieYear !== year.value) {
      year.value = normalizedCookieYear
    }
  })

  // If year is provided in route query, treat it as source of truth for navigation.
  watch(
    () => route.query.year,
    (nextRouteYear) => {
      if (typeof nextRouteYear === 'string') {
        const normalizedRouteYear = normalizeYear(nextRouteYear)
        if (normalizedRouteYear !== year.value) {
          year.value = normalizedRouteYear
        }
      } else if (Array.isArray(nextRouteYear) && typeof nextRouteYear[0] === 'string') {
        const normalizedRouteYear = normalizeYear(nextRouteYear[0])
        if (normalizedRouteYear !== year.value) {
          year.value = normalizedRouteYear
        }
      }
    },
    { immediate: true }
  )

  const selectedTeam = computed(
    () => APP_TEAMS.find((team) => team.year === year.value) ?? APP_TEAMS[0]!
  )

  const setYear = (nextYear: string) => {
    year.value = normalizeYear(nextYear)
  }

  const withYearQuery = (query: Record<string, unknown> = {}) => ({
    ...query,
    year: year.value
  })

  const withYearBody = <T extends Record<string, unknown>>(body: T) => ({
    ...body,
    year: year.value
  })

  return {
    teams: APP_TEAMS,
    year,
    selectedTeam,
    setYear,
    withYearQuery,
    withYearBody
  }
}
