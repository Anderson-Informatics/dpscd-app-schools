export type Result = {
  _id: string;
  submissionId: string;
  rank: number;
  entries?: number;
  Grade: string;
  SchoolID: number;
  School: string;
  FirstName: string;
  LastName: string;
  ChoiceRank: number;
  Priority?: number;
  submissionDate: string;
  lotteryList: string;
  adjustedRank?: number | null;
  TestDate?: Date;
  comment?: string;
  stage?: string;
  action?: string;
  actionLong?: string;
  notes?: string;
  newList?: string;
  queueStatus?: string | null;
  queueDate?: Date;
  confirmedEnrollment?: boolean;
  update?: {
    queueStatus?: string | null;
    queueDate?: Date | null;
    lotteryList?: string;
    adjustedRank?: number | null;
    confirmedEnrollment?: boolean;
  };
  type?: string;
  contact?: {
    submissionId?: string;
    ParentFirst?: string;
    ParentLast?: string;
    ParentPhone?: string;
    ParentEmail?: string;
  };
  results?: [
    {
      _id?: string;
      submissionId?: string;
      School?: string;
      ChoiceRank?: number;
      adjustedRank?: number;
      lotteryList?: string;
    }
  ];
};
