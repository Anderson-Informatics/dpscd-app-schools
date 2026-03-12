import mongoose from 'mongoose'

const schema: mongoose.Schema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  applyLabels: Boolean,
  applyNotes: {
    type: Boolean,
    default: true
  },
  year: String
})

// settings model
export default mongoose.model('Setting', schema)
