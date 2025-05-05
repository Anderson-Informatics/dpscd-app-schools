import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema({
  _id: String,
  submissionId: String,
  SchoolID: Number,
  School: String,
  GradeEntering: String,
  ChoiceRank: Number,
  GradeAvailable: Boolean,
  submissionIdInt: String,
  FullName: String,
  Round: String,
  AgeEligible: Boolean,
  AgeExemption: Number,
  ExamTaken: Boolean,
  ExamScore: Number,
  ExamScoreType: String,
  ExamScoreSort: Number,
  QualifyingScore: Number,
  Qualified: Boolean,
  Eligible: Boolean,
  EligibilityStatus: String,
});

// qualifications model
export default mongoose.model("Qualification", schema);
