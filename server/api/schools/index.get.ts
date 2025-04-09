import SchoolModel from "~~/server/models/school.model";

export default defineEventHandler(async (event) => {
  const schools = await SchoolModel.find();

  return schools;
});
