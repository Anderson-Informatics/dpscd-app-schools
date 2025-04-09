import type { Result } from "~~/types/result";

export default function (payload: Result, results: Result[], list: string) {
  const filteredList: Result[] = results.filter(
    (item) =>
      item.SchoolID === payload.SchoolID &&
      item.Grade === payload.Grade &&
      item.lotteryList === list
  );
  const maxRank = Math.max(
    ...filteredList.map((x: Result) => x.adjustedRank ?? 0)
  );
  if (maxRank === 0) {
    return 0;
  } else {
    return maxRank;
  }
}
