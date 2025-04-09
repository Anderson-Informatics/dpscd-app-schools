import mongoose from "mongoose";

const schema: mongoose.Schema = new mongoose.Schema({
  _id: String,
  SchoolID: Number,
  SchoolName: String,
  Lat: Number,
  Lng: Number,
  Type: String,
  ShortName: String,
  Capacity: Object,
});

// schools model
export default mongoose.model("School", schema);
