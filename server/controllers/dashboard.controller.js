const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// ─── Dashboard Analytics ───────────────────────────────────────────────────────
// GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Run all queries in parallel
    const [
      totalStudents,
      totalClasses,
      todayAttendance,
      recentAttendance,
      weeklyStats,
    ] = await Promise.all([
      // Total active students
      Student.countDocuments({ isActive: true }),

      // Total distinct classes
      Student.distinct('class', { isActive: true }),

      // Today's attendance stats
      Attendance.aggregate([
        { $match: { date: { $gte: today, $lte: todayEnd } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Recent 5 attendance records
      Attendance.find({ date: { $gte: today, $lte: todayEnd } })
        .populate('studentId', 'name rollNumber class')
        .sort({ createdAt: -1 })
        .limit(5),

      // Last 7 days attendance trend
      Attendance.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              $lte: todayEnd,
            },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]),
    ]);

    // Format today's stats
    const todayStats = { Present: 0, Absent: 0, Late: 0 };
    todayAttendance.forEach((item) => {
      todayStats[item._id] = item.count;
    });
    const todayTotal = Object.values(todayStats).reduce((a, b) => a + b, 0);

    // Format weekly trend
    const weeklyMap = {};
    weeklyStats.forEach((item) => {
      if (!weeklyMap[item._id.date]) {
        weeklyMap[item._id.date] = { date: item._id.date, Present: 0, Absent: 0, Late: 0 };
      }
      weeklyMap[item._id.date][item._id.status] = item.count;
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalClasses: totalClasses.length,
        todayStats: { ...todayStats, total: todayTotal },
        recentAttendance,
        weeklyTrend: Object.values(weeklyMap),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
};

module.exports = { getDashboard };
