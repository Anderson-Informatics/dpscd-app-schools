import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema({
  _id: String,
  submissionId: String,
  rank: Number,
  entries: Number,
  Grade: String,
  SchoolID: Number,
  School: String,
  FirstName: String,
  LastName: String,
  ChoiceRank: Number,
  Priority: Number,
  submissionDate: Date,
  lotteryList: String,
  adjustedRank: Number,
  comment: String,
  TestDate: Date,
  queueStatus: String,
  queueDate: Date,
  confirmedEnrollment: Boolean,
});

// results model
export default mongoose.model("Result", schema);
