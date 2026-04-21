export type Review = {
  _id: string
  submissionId: string
  submissionIdInt: string
  FullName: string
  GradeEntering: string
  ReviewType: string
  completedAt?: string | null
  score?: number | null
  complete: boolean
  year?: string
}
