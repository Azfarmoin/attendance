const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// ─── Mark Attendance (Bulk) ────────────────────────────────────────────────────
// POST /api/attendance
const markAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    // records = [{ studentId, date, subject, status, remarks }]

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'No attendance records provided' });
    }

    const results = { created: 0, updated: 0, errors: [] };

    for (const record of records) {
      try {
        const dateOnly = new Date(record.date);
        dateOnly.setHours(0, 0, 0, 0);

        // Upsert: update if exists, create if not
        await Attendance.findOneAndUpdate(
          { studentId: record.studentId, date: dateOnly, subject: record.subject },
          { ...record, date: dateOnly, markedBy: req.user._id },
          { upsert: true, new: true, runValidators: true }
        );
        results.created++;
      } catch (err) {
        results.errors.push({ studentId: record.studentId, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Attendance marked for ${results.created} students`,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark attendance' });
  }
};

// ─── Get Attendance Records ────────────────────────────────────────────────────
// GET /api/attendance
const getAttendance = async (req, res) => {
  try {
    const { date, subject, class: studentClass, page = 1, limit = 20 } = req.query;

    let matchQuery = {};

    // Filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      matchQuery.date = { $gte: startDate, $lte: endDate };
    }

    if (subject) matchQuery.subject = { $regex: subject, $options: 'i' };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
    ];

    // Filter by class (from student data)
    if (studentClass) {
      pipeline.push({ $match: { 'student.class': studentClass } });
    }

    pipeline.push({ $sort: { date: -1, 'student.rollNumber': 1 } });

    const countPipeline = [...pipeline, { $count: 'total' }];
    pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

    const [records, countResult] = await Promise.all([
      Attendance.aggregate(pipeline),
      Attendance.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      records,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
};

// ─── Get Attendance By Student ─────────────────────────────────────────────────
// GET /api/attendance/:studentId
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subject, startDate, endDate } = req.query;

    const query = { studentId };

    if (subject) query.subject = { $regex: subject, $options: 'i' };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const records = await Attendance.find(query)
      .populate('studentId', 'name rollNumber class')
      .sort({ date: -1 });

    // Calculate attendance percentage
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const percentage = total > 0 ? (((present + late) / total) * 100).toFixed(1) : 0;

    // Stats by subject
    const subjectStats = {};
    records.forEach((r) => {
      if (!subjectStats[r.subject]) {
        subjectStats[r.subject] = { total: 0, present: 0, late: 0, absent: 0 };
      }
      subjectStats[r.subject].total++;
      subjectStats[r.subject][r.status.toLowerCase()]++;
    });

    res.json({
      success: true,
      records,
      stats: { total, present, late, absent, percentage },
      subjectStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch student attendance' });
  }
};

// ─── Get Attendance for a Specific Date & Subject ─────────────────────────────
// GET /api/attendance/sheet?date=&subject=&class=
const getAttendanceSheet = async (req, res) => {
  try {
    const { date, subject, class: studentClass } = req.query;

    if (!date || !subject) {
      return res.status(400).json({ success: false, message: 'Date and subject are required' });
    }

    // Fetch all active students for the class
    const studentQuery = { isActive: true };
    if (studentClass) studentQuery.class = studentClass;
    const students = await Student.find(studentQuery).sort({ rollNumber: 1 });

    // Fetch existing attendance records
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const existing = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
      subject,
      studentId: { $in: students.map((s) => s._id) },
    });

    // Map existing records by studentId
    const existingMap = {};
    existing.forEach((r) => {
      existingMap[r.studentId.toString()] = r;
    });

    // Build attendance sheet
    const sheet = students.map((student) => ({
      student,
      attendance: existingMap[student._id.toString()] || null,
    }));

    res.json({ success: true, sheet, date, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch attendance sheet' });
  }
};

module.exports = { markAttendance, getAttendance, getStudentAttendance, getAttendanceSheet };
