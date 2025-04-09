import ResultModel from "~~/server/models/result.model";

export default defineEventHandler(async (event) => {
  const results = await ResultModel.find();

  return results;
});
