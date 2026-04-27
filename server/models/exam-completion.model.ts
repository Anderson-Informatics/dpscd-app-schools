import mongoose from 'mongoose'

type ExamCompletionDocument = {
  submissionId?: string
  submissionIdInt?: string
  FullName?: string
  GradeEntering?: string
  Round?: string
  ExamRequired?: boolean
  TestDate?: Date
  ExamTaken?: boolean
  ExamScore?: number
  complete?: boolean
  year?: string | number
}

const schema: mongoose.Schema = new mongoose.Schema(
  {
    submissionId: String,
    submissionIdInt: String,
    FullName: String,
    GradeEntering: String,
    Round: String,
    ExamRequired: Boolean,
    TestDate: Date,
    ExamTaken: Boolean,
    ExamScore: Number,
    complete: Boolean,
    year: mongoose.Schema.Types.Mixed
  },
  {
    collection: 'exam_completions'
  }
)

const ExamCompletionModel =
  (mongoose.models.ExamCompletion as mongoose.Model<ExamCompletionDocument>) ||
  mongoose.model<ExamCompletionDocument>('ExamCompletion', schema)

export default ExamCompletionModel
