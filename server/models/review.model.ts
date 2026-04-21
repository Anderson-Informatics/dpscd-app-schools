import mongoose from 'mongoose'

const schema: mongoose.Schema = new mongoose.Schema({
  _id: String,
  submissionId: String,
  submissionIdInt: String,
  FullName: String,
  GradeEntering: String,
  ReviewType: String,
  completedAt: String,
  score: Number,
  complete: Boolean,
  year: String
})

// reviews model
export default mongoose.model('Review', schema)
