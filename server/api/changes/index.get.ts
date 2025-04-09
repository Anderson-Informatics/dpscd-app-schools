import ChangeModel from "~~/server/models/change.model";

export default defineEventHandler(async (event) => {
  const changes = await ChangeModel.find();

  return changes;
});
