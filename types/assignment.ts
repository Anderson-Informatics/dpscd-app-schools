export type Assignment = {
  _id: string | { toString: () => string }
  submissionId: string
  ReviewerId?: string | null
  ReviewerTitle?: string | null
  ReviewerName?: string | null
  ReviewerSchoolName?: string | null
  ReviewerSchoolID?: number | null
  submissionIdInt?: string | null
  submissionStatus?: string | null
  stageName?: string | null
  FullName?: string | null
  Round?: string | null
  year?: string | null
  ExpectedReviewSource?: string | null
  ReviewFound?: boolean | null
  AssignmentComplete?: boolean | null
  AssignmentCompleted?: boolean | null
  ReviewStatusMatched?: string | null
}
