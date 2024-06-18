const { bcryptUtil } = require("../config/hash")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const CTDT = require('../models/ctdt')
const User = require('../models/user')
const Course = require("../models/course")
const Class = require("../models/class")
const ClassExam = require("../models/classExam")
const classExam = require("../models/classExam")
const Joi = require('joi');

module.exports = {
  getClassExams: async (req, res) => {
    try {
      const currentPage = parseInt(req.query.page) || 1;
      const itemsPerPage = 1; // Thay đổi số lượng mục mỗi trang nếu cần
      const searchCode = req.query.mhp || '';
      const searchName = req.query.thp || '';

      let query = {};
      if (searchCode) {
        query.classId = { $regex: searchCode, $options: 'i' };
      }
      if (searchName) {
        query['classId.name'] = { $regex: searchName, $options: 'i' };
      }

      const totalItems = await ClassExam.countDocuments(query);
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      const classExamResults = await ClassExam.find(query)
        .populate({
          path: 'classId',
          populate: {
            path: 'idCourse',
            model: 'course'
          }
        })
        .populate({
          path: 'teacherId',
          select: 'name'
        })
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage);

      res.render('build/pages/classexams_management.ejs', {
        listClassExam: classExamResults,
        totalPages: totalPages,
        currentPage: currentPage,
        searchCode: searchCode,
        searchName: searchName,
        user: req.user
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  searchClassExamsByName: async (req, res) => {
    try {
      const { className } = req.body;

      let query = {};
      if (className) {
        query = { 'classId.name': { $regex: new RegExp(className, 'i') } };
      }

      let results = await ClassExam.find(query)
        .populate({
          path: 'classId',
          populate: {
            path: 'idCourse',
            model: 'course'
          }
        })
        .populate({
          path: 'teacherId',
          select: 'name'
        });

      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },


  postClassExams: async (req, res) => {
    const newData = req.body;
    try {
      const createdData = await ClassExam.create(newData);
      res.status(201).json(createdData); // Trả về dữ liệu mới đã được thêm vào
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  putClassExams: async (req, res) => {
    const ClassID = req.params.idClassExam;
    console.log(ClassID)
    const newData = req.body;
    try {
      const updatedData = await ClassExam.findByIdAndUpdate(ClassID, newData, { new: true });
      res.status(200).json(updatedData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  deleteClassExams: async (req, res) => {
    const ClassID = req.params.idClassExam;

    try {
      // Xóa dữ liệu từ cơ sở dữ liệu dựa trên _id
      await ClassExam.findByIdAndDelete(ClassID);
      res.status(204).end(); // Trả về mã trạng thái 204 (No Content) khi xóa thành công
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  searchStudentsExam: async (req, res) => {
    try {
      const { idClassExam } = req.params;
      const currentPage = parseInt(req.query.page) || 1;
      const itemsPerPage = parseInt(req.query.limit) || 5;
      const searchInputCode = req.query.mssv || ''; // Lấy mã sinh viên từ query string
      const searchInputName = req.query.name || ''; // Lấy tên sinh viên từ query string

      // Find the class data including the students
      const classExamData = await Class.findById(idClassExam).populate('idStudents');
      if (!classExamData) {
        return res.status(404).send("Class not found");
      }

      // Filter students based on search criteria (mã sinh viên và tên sinh viên)
      const filteredStudents = classExamData.idStudents.filter(student => {
        return student.mssv.includes(searchInputCode) && student.name.includes(searchInputName);
      });

      const totalStudents = filteredStudents.length;
      const totalPages = Math.ceil(totalStudents / itemsPerPage);

      // Paginate the filtered students
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = currentPage * itemsPerPage;
      const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

      const allStudents = await User.find({ role: 'student' });

      // Render the template with the data
      res.render('build/pages/listStudentInClassExam.ejs', {
        listStudentByClassExam: paginatedStudents,
        listUserByCTDT: allStudents,
        classExamId: idClassExam,
        totalPages: totalPages,
        currentPage: currentPage
      });
    } catch (error) {
      console.error("Error searching for students:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  getStudentByClassExam: async (req, res) => {
    try {
      const { idClassExam } = req.params;
      let classExamData = await classExam.findById(idClassExam).populate('idStudents').populate('idStudentsDiemDanh');
      if (!classExamData) {
        return res.status(404).send("Class Exam not found");
      }

      // Tạo danh sách sinh viên duy nhất và đánh dấu trạng thái
      let uniqueStudents = new Map();

      classExamData.idStudents.forEach(student => {
        uniqueStudents.set(student._id.toString(), { ...student._doc, inClass: true, attended: false });
      });

      classExamData.idStudentsDiemDanh.forEach(student => {
        if (uniqueStudents.has(student._id.toString())) {
          uniqueStudents.get(student._id.toString()).attended = true;
        } else {
          uniqueStudents.set(student._id.toString(), { ...student._doc, inClass: false, attended: true });
        }
      });
      const allStudents = await User.find({ role: 'student' });

      // Mark students who are already in the class
      allStudents.forEach(student => {
        if (uniqueStudents.has(student._id.toString())) {
          student.inClassExam = true;
        } else {
          student.inClassExam = false;
        }
      });
      return res.render('build/pages/listStudentInClassExam.ejs', {
        listStudentByClassExam: Array.from(uniqueStudents.values()),
        listUserByCTDT: allStudents,
        idClassExam: idClassExam
      });
    } catch (error) {
      console.error("Error fetching class exam data:", error);
      return res.status(500).send("Internal Server Error");
    }
  },
  addStudentToClassExam: async (req, res) => {
    try {
      const { idClassExam, studentId } = req.params;
      let classExamData = await ClassExam.findById(idClassExam);

      if (!classExamData) {
        return res.status(404).send("Class not found");
      }

      if (!classExamData.idStudents.includes(studentId)) {
        classExamData.idStudents.push(studentId);
        await classExamData.save();
      }

      res.status(200).send("Student added to class");
    } catch (error) {
      console.error("Error adding student to class:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  deleteStudentFromClassExam: async (req, res) => {
    const { idClassExam, studentId } = req.params;

    try {
      const classExam = await ClassExam.findById(idClassExam);

      if (!classExam) {
        return res.status(404).json({ message: 'Class not found' });
      }

      const updateFields = {};

      if (classExam.idStudents.includes(studentId)) {
        updateFields.idStudents = studentId;
      }

      if (classExam.idStudentsDiemDanh.includes(studentId)) {
        updateFields.idStudentsDiemDanh = studentId;
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(404).json({ message: 'Student not found in the class or attendance list' });
      }

      const updatedClassExam = await ClassExam.findByIdAndUpdate(
        idClassExam,
        {
          $pull: updateFields
        },
        { new: true }
      );

      res.status(200).json({ message: 'Student removed from class and/or attendance list', updatedClassExam });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

}