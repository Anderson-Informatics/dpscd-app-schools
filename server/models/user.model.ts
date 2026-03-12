import mongoose from 'mongoose'

const schema: mongoose.Schema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    auto: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: String,
  role: {
    type: String,
    enum: ['central office admin', 'school admin', 'unassigned'],
    default: 'unassigned'
  },
  schoolId: Number,
  schoolName: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt timestamp on save
schema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

// users model
export default mongoose.model('User', schema)
