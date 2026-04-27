export type ExamCompletion = {
  _id: string
  submissionId: string
  submissionIdInt: string
  FullName: string
  GradeEntering: string
  Round?: string | null
  ExamRequired?: boolean | null
  TestDate?: string | Date | null
  ExamTaken?: boolean | null
  ExamScore?: number | null
  complete: boolean
  year?: string | number
}
