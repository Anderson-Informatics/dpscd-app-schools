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
    complete: Boolean
  },
  {
    collection: 'exam_completions'
  }
)

const examCompletionsDb = mongoose.connection.useDb('exam_completions', {
  useCache: true
})

const ExamCompletionModel =
  (examCompletionsDb.models.ExamCompletion as mongoose.Model<ExamCompletionDocument>) ||
  examCompletionsDb.model<ExamCompletionDocument>('ExamCompletion', schema)

export default ExamCompletionModel
