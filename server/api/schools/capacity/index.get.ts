import SchoolModel from "~~/server/models/school.model";
import ResultModel from "~~/server/models/result.model";
import type { School, SchoolGrade, Count } from "~~/types/school";

export default defineEventHandler(async (event) => {
  const schools: School[] = await SchoolModel.find();

  const counts: Count[] = await ResultModel.aggregate([
    {
      $group: {
        _id: {
          SchoolID: "$SchoolID",
          School: "$School",
          Grade: "$Grade",
        },
        SeatsFilled: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  {
                    $eq: ["Offered List", "$lotteryList"],
                  },
                  {
                    $eq: ["Offer Pending", "$queueStatus"],
                  },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
        OnWaitingList: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  {
                    $eq: ["Waiting List", "$lotteryList"],
                  },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
        OnSecondaryWaitingList: {
          $sum: {
            $cond: {
              if: {
                $or: [
                  {
                    $eq: ["Secondary Waitlist", "$lotteryList"],
                  },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
  ]);

  const schcap = schools.map((item: School) => ({
    SchoolID: item.SchoolID,
    School: item.SchoolName,
    ...item.Capacity,
  }));

  const unwindCapacity = (object: School) => {
    return Object.keys(object.Capacity).map((item) => ({
      SchoolID: Number(object.SchoolID),
      School: object.SchoolName,
      Grade: item,
      Capacity: object.Capacity[item] ?? 0,
    }));
  };

  const createCapacity = (x: School[]) => {
    let full: {
      SchoolID: number;
      School: string;
      Grade: string;
      Capacity: number;
    }[] = [];
    x.forEach((element) => {
      full.push(...unwindCapacity(element));
    });
    return full;
  };

  const unwound = createCapacity(schools);

  const seats = counts
    .map((item) => ({
      ...item._id,
      ...item,
    }))
    .map(({ _id, ...item }) => item);

  const partialCapacityTable: {
    SchoolID: number;
    School: string;
    Grade: string;
    Capacity: number;
    SeatsFilled: number;
    OnWaitingList: number;
    OnSecondaryWaitingList: number;
  }[] = [];

  seats.forEach((seat) => {
    const capacityItem = unwound.find(
      (item) => seat.SchoolID === item.SchoolID && seat.Grade === item.Grade
    );

    if (capacityItem) {
      partialCapacityTable.push({
        ...seat,
        ...capacityItem,
      });
    }
  });

  const fullCapacityTable = partialCapacityTable.map((item) => ({
    ...item,
    SeatsAvailable: item.Capacity - item.SeatsFilled,
  }));

  //const clean = seats.map(({ _id, ...item }) => item);

  return fullCapacityTable;
});
