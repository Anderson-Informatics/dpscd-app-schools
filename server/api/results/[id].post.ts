import ResultModel from "~~/server/models/result.model";

export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody(event);
  console.log(body);
  const id = event.context.params?.id;
  if (!id) {
    throw createError({
      message: "ID parameter is missing",
    });
  }

  // Update a result
  try {
    await ResultModel.findByIdAndUpdate(id, body);
    return { message: "Lottery placement result updated" };
  } catch (e: any) {
    throw createError({
      message: e.message,
    });
  }
});
