import mongoose from 'mongoose'

const schema: mongoose.Schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  submissionId: String,
  ReviewerId: String,
  ReviewerTitle: String,
  ReviewerName: String,
  ReviewerSchoolName: String,
  ReviewerSchoolID: Number,
  submissionIdInt: String,
  submissionStatus: String,
  stageName: String,
  FullName: String,
  Round: String,
  year: String,
  ExpectedReviewSource: String,
  ReviewFound: Boolean,
  AssignmentComplete: Boolean,
  AssignmentCompleted: Boolean,
  ReviewStatusMatched: String
})

// assignments model
export default mongoose.model('Assignment', schema)
