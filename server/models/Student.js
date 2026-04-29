const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
    },
    section: {
      type: String,
      trim: true,
      uppercase: true,
    },
    contact: {
      type: String,
      trim: true,
      match: [/^[\d\s\+\-\(\)]{7,15}$/, 'Please enter a valid contact number'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    guardianName: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Index for faster queries
studentSchema.index({ class: 1, rollNumber: 1 });
studentSchema.index({ name: 'text', rollNumber: 'text' });

module.exports = mongoose.model('Student', studentSchema);
