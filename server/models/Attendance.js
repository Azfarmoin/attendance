const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Present', 'Absent', 'Late'],
        message: 'Status must be Present, Absent, or Late',
      },
      required: [true, 'Status is required'],
    },
    remarks: {
      type: String,
      trim: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same student, date, and subject
attendanceSchema.index(
  { studentId: 1, date: 1, subject: 1 },
  { unique: true }
);

// Virtual for formatted date
attendanceSchema.virtual('formattedDate').get(function () {
  return this.date.toISOString().split('T')[0];
});

module.exports = mongoose.model('Attendance', attendanceSchema);
