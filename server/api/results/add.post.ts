import ResultModel from "~~/server/models/result.model";

export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody(event);
  console.log(body);

  // Update a result
  try {
    await ResultModel.insertOne(body);
    return { message: "Lottery placement result added" };
  } catch (e: any) {
    throw createError({
      message: e.message,
    });
  }
});
