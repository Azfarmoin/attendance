const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getAttendanceSheet,
} = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/sheet', getAttendanceSheet);
router.route('/').post(markAttendance).get(getAttendance);
router.get('/:studentId', getStudentAttendance);

module.exports = router;
