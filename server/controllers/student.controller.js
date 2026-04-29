const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// ─── Get All Students ──────────────────────────────────────────────────────────
// GET /api/students
const getStudents = async (req, res) => {
  try {
    const { search, class: studentClass, page = 1, limit = 10, all } = req.query;

    const query = { isActive: true };

    // Search by name or roll number
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by class
    if (studentClass) query.class = studentClass;

    // If `all=true`, return all students without pagination (for dropdowns)
    if (all === 'true') {
      const students = await Student.find(query).sort({ rollNumber: 1 });
      return res.json({ success: true, students });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Student.countDocuments(query),
    ]);

    res.json({
      success: true,
      students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
};

// ─── Get Single Student ────────────────────────────────────────────────────────
// GET /api/students/:id
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student || !student.isActive) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch student' });
  }
};

// ─── Create Student ────────────────────────────────────────────────────────────
// POST /api/students
const createStudent = async (req, res) => {
  try {
    const student = await Student.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, message: 'Student created successfully', student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Roll number already exists',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Failed to create student' });
  }
};

// ─── Update Student ────────────────────────────────────────────────────────────
// PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, message: 'Student updated successfully', student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Roll number already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to update student' });
  }
};

// ─── Delete Student (Soft Delete) ─────────────────────────────────────────────
// DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete student' });
  }
};

// ─── Get Distinct Classes ──────────────────────────────────────────────────────
// GET /api/students/classes
const getClasses = async (req, res) => {
  try {
    const classes = await Student.distinct('class', { isActive: true });
    res.json({ success: true, classes: classes.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch classes' });
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getClasses };
