import SchoolModel from '~~/server/models/school.model'
import ResultModel from '~~/server/models/result.model'
import type { School, Count } from '~~/types/school'
import { getYearFromEvent, withYearFilter } from '~~/server/utils/year'

export default defineEventHandler(async (event) => {
  const year = getYearFromEvent(event)
  const schools: School[] = await SchoolModel.find(withYearFilter(year))

  const counts: Count[] = await ResultModel.aggregate([
    {
      $match: withYearFilter(year)
    },
    {
      $group: {
        _id: {
          SchoolID: '$SchoolID',
          School: '$School',
          Grade: '$Grade'
        },
        SeatsFilled: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  {
                    $eq: ['Offered List', '$lotteryList']
                  },
                  {
                    $eq: ['Offer Pending', '$queueStatus']
                  }
                ]
              },
              then: 1,
              else: 0
            }
          }
        },
        OnWaitingList: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  {
                    $eq: ['Waiting List', '$lotteryList']
                  }
                ]
              },
              then: 1,
              else: 0
            }
          }
        },
        OnSecondaryWaitingList: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  {
                    $eq: ['Secondary Waitlist', '$lotteryList']
                  }
                ]
              },
              then: 1,
              else: 0
            }
          }
        }
      }
    }
  ])

  const unwindCapacity = (object: School) => {
    return Object.keys(object.Capacity).map((item) => ({
      SchoolID: Number(object.SchoolID),
      School: object.SchoolName,
      Grade: item,
      Capacity: object.Capacity[item] ?? 0
    }))
  }

  const createCapacity = (x: School[]) => {
    const full: {
      SchoolID: number
      School: string
      Grade: string
      Capacity: number
    }[] = []
    x.forEach((element) => {
      full.push(...unwindCapacity(element))
    })
    return full
  }

  const unwound = createCapacity(schools)

  const seats = counts
    .map((item) => ({
      ...item._id,
      ...item
    }))
    .map(({ _id, ...item }) => item)

  // Create a map of seats for quick lookup
  const seatsMap = new Map<string, (typeof seats)[0]>()
  seats.forEach((seat) => {
    const key = `${seat.SchoolID}|${seat.Grade}`
    seatsMap.set(key, seat)
  })

  // Include all schools and grades, merging in seat data where available
  const fullCapacityTable = unwound.map((school) => {
    const key = `${school.SchoolID}|${school.Grade}`
    const seatData = seatsMap.get(key)
    const capacity = school.Capacity ?? 0

    return {
      ...school,
      SeatsFilled: seatData?.SeatsFilled ?? 0,
      OnWaitingList: seatData?.OnWaitingList ?? 0,
      OnSecondaryWaitingList: seatData?.OnSecondaryWaitingList ?? 0,
      SeatsAvailable: capacity === -1 ? -1 : capacity - (seatData?.SeatsFilled ?? 0)
    }
  })

  return fullCapacityTable
})
