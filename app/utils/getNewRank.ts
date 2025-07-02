import type { Result } from "~~/types/result";
import type { Qualification } from "~~/types/qualification";

export default function (payload: Qualification, results: Result[]) {
  const filteredList: Result[] = results.filter(
    (item) =>
      item.SchoolID === payload.SchoolID && item.Grade === payload.GradeEntering
  );
  const maxRank = Math.max(...filteredList.map((x: Result) => x.rank ?? 0));
  if (maxRank === 0) {
    return 1;
  } else {
    return maxRank + 1;
  }
}
