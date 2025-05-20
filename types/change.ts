export type Change = {
  changes: string[];
  ids: string[];
  userId: string;
  userEmail: string;
  userName: string;
  notes: string;
  date: Date;
  log: Array<{ submissionId: string; change: string } | null>;
};
