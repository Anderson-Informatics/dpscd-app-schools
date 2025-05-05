import QualificationModel from "~~/server/models/qualification.model";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.submissionId;
  const qualifications = await QualificationModel.find({ submissionId: id });

  return qualifications;
});
