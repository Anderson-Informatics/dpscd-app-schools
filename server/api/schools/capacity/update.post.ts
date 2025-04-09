import SchoolModel from "~~/server/models/school.model";

export default defineEventHandler(async (event) => {
  // Get data from body
  const body = await readBody(event);
  console.log(body);

  // Update a result
  try {
    await SchoolModel.updateOne(
      { SchoolID: body.SchoolID },
      {
        $set: {
          [`Capacity.${body.Grade}`]: body.Capacity,
        },
      }
    );
    return { message: "Capacity updated" };
  } catch (e: any) {
    throw createError({
      message: e.message,
    });
  }
});
