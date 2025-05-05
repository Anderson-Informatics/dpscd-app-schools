import QualificationModel from "~~/server/models/qualification.model";

export default defineEventHandler(async (event) => {
  const qualifications = await QualificationModel.find();

  return qualifications;
});
