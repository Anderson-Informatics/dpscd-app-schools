import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema({
  _id: String,
  changes: Array,
  ids: Array,
  userId: String,
  userEmail: String,
  notes: String,
  date: Date,
  log: [
    {
      submissionId: String,
      change: String,
    },
  ],
});

// history model
export default mongoose.model("Change", schema);
