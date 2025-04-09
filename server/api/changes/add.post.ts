import ChangeModel from "~~/server/models/change.model";
import mongoose from "mongoose";

export default defineEventHandler(async (event) => {
  // Get data form body
  const body = await readBody(event);

  try {
    const response = await ChangeModel.create({
      _id: new mongoose.Types.ObjectId().toHexString(),
      ...body,
    });
    return response;
  } catch (e: any) {
    throw createError({
      message: e.message,
    });
  }
});
