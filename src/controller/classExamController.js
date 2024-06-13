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

      return res.render('build/pages/listStudentInClassExam.ejs', {
        listStudentByClassExam: Array.from(uniqueStudents.values()),
        idClassExam: idClassExam
      });
    } catch (error) {
      console.error("Error fetching class exam data:", error);
      return res.status(500).send("Internal Server Error");
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
  }
}