import type { Result } from "~~/types/result";

export default function (
  SchoolID: number,
  Grade: string,
  results: Result[],
  list: string
) {
  const filteredList: Result[] = results.filter(
    (item) =>
      item.SchoolID === SchoolID &&
      item.Grade === Grade &&
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
