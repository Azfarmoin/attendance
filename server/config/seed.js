const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://azfarmoin:erum12345@cluster0.xsuzcru.mongodb.net/?appName=Cluster0';

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Biology'];
const classes = ['10-A', '10-B', '11-A', '11-B', '12-A'];

const studentData = [
  { name: 'Ali Hassan', rollNumber: 'CS-001', class: '10-A', section: 'A', contact: '0300-1234567' },
  { name: 'Fatima Khan', rollNumber: 'CS-002', class: '10-A', section: 'A', contact: '0301-2345678' },
  { name: 'Usman Ahmed', rollNumber: 'CS-003', class: '10-A', section: 'A', contact: '0302-3456789' },
  { name: 'Ayesha Malik', rollNumber: 'CS-004', class: '10-B', section: 'B', contact: '0303-4567890' },
  { name: 'Bilal Raza', rollNumber: 'CS-005', class: '10-B', section: 'B', contact: '0304-5678901' },
  { name: 'Sana Tariq', rollNumber: 'CS-006', class: '11-A', section: 'A', contact: '0305-6789012' },
  { name: 'Hamza Iqbal', rollNumber: 'CS-007', class: '11-A', section: 'A', contact: '0306-7890123' },
  { name: 'Zainab Shah', rollNumber: 'CS-008', class: '11-B', section: 'B', contact: '0307-8901234' },
  { name: 'Omar Farooq', rollNumber: 'CS-009', class: '12-A', section: 'A', contact: '0308-9012345' },
  { name: 'Mariam Hussain', rollNumber: 'CS-010', class: '12-A', section: 'A', contact: '0309-0123456' },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Attendance.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.create([
      { name: 'Admin User', email: 'admin@school.com', password: 'admin123', role: 'admin' },
      { name: 'Teacher Ahmed', email: 'teacher@school.com', password: 'teacher123', role: 'teacher' },
    ]);
    console.log('👥 Created users');

    // Create students
    const students = await Student.create(
      studentData.map((s) => ({ ...s, createdBy: users[0]._id }))
    );
    console.log('🎓 Created students');

    // Generate 30 days of attendance
    const attendanceRecords = [];
    const statuses = ['Present', 'Present', 'Present', 'Present', 'Absent', 'Late'];

    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const subject of subjects.slice(0, 3)) {
        for (const student of students) {
          attendanceRecords.push({
            studentId: student._id,
            date,
            subject,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            markedBy: users[1]._id,
          });
        }
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`📋 Created ${attendanceRecords.length} attendance records`);

    console.log('\n✨ Seed completed successfully!');
    console.log('─'.repeat(40));
    console.log('🔑 Login Credentials:');
    console.log('   Admin:   admin@school.com   / admin123');
    console.log('   Teacher: teacher@school.com / teacher123');
    console.log('─'.repeat(40));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
