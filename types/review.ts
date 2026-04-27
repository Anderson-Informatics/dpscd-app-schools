export type Review = {
  _id: string
  submissionId: string
  submissionIdInt: string
  FullName: string
  GradeEntering: string
  Round?: string | null
  ReviewType: string
  completedAt?: string | null
  score?: number | null
  complete: boolean
  year?: string
}
