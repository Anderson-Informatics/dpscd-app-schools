import SubmissionModel from "~~/server/models/submission.model";

export default defineEventHandler(async (event) => {
  const id = event.context.params?.submissionId;
  const submission = await SubmissionModel.findOne({ submissionId: id });

  return submission;
});
