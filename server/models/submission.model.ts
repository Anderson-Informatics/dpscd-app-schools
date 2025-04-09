import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  submissionId: {
    type: String,
    required: true,
  },
  submissionStatus: {
    type: String,
    required: true,
  },
  submitterFirstName: {
    type: String,
    required: true,
  },
  submitterLastName: {
    type: String,
    required: true,
  },
  submitterEmail: {
    type: String,
    required: true,
  },
  submitterLastLoginDate: {
    type: Date,
    required: true,
  },
  submissionDate: {
    type: Date,
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  FullName: {
    type: String,
    required: true,
  },
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    required: true,
  },
  ParentFirst: {
    type: String,
    required: true,
  },
  ParentLast: {
    type: String,
    required: true,
  },
  ParentPhone: {
    type: String,
    required: true,
  },
  ParentEmail: {
    type: String,
    required: true,
  },
  DOB: {
    type: Date,
    required: true,
  },
  Address1: {
    type: String,
    required: true,
  },
  Address2: {
    type: String,
    required: false,
  },
  City: {
    type: String,
    required: true,
  },
  State: {
    type: String,
    required: true,
  },
  Zip: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
    required: true,
  },
  Grade: {
    type: String,
    required: true,
  },
  FirstChoiceSchool: {
    type: String,
    required: false,
  },
  SecondChoiceSchool: {
    type: String,
    required: false,
  },
  ThirdChoiceSchool: {
    type: String,
    required: false,
  },
  IEP: {
    type: String,
    required: true,
  },
  AgeEligible: {
    type: String,
    required: true,
  },
  MontMG: {
    type: Boolean,
    required: true,
  },
  Exam: {
    type: Boolean,
    required: true,
  },
  ExamRequired: {
    type: Boolean,
    required: true,
  },
  History: {
    type: Array,
    required: false,
  },
});

// submission model
export default mongoose.model("Submission", schema);
