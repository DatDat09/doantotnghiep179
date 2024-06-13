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
  getCourse: async (req, res) => {
    try {
      const currentPage = parseInt(req.query.page) || 1;
      const itemsPerPage = 5;
      const searchCode = req.query.mhp || '';
      const searchName = req.query.thp || '';

      let query = {};
      if (searchCode) {
        query.maHocPhan = { $regex: searchCode, $options: 'i' };
      }
      if (searchName) {
        query.name = { $regex: searchName, $options: 'i' };
      }

      const totalItems = await Course.countDocuments(query);
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      const courses = await Course.find(query)
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage);

      res.render('build/pages/course_management', {
        listCourse: courses,
        totalPages: totalPages,
        currentPage: currentPage,
        searchCode: searchCode,
        searchName: searchName,
        user: req.user
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi máy chủ');
    }
  },

  postCourses: async (req, res) => {
    const newData = req.body;
    try {
      const createdData = await Course.create(newData);
      res.status(201).json(createdData); // Trả về dữ liệu mới đã được thêm vào
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  putCourses: async (req, res) => {
    const CourseID = req.params.idCourse;
    const newData = req.body;
    try {
      const updatedData = await Course.findByIdAndUpdate(CourseID, newData, { new: true });
      res.status(200).json(updatedData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  deteteCourses: async (req, res) => {
    const CourseID = req.params.idCourse;

    try {
      // Xóa dữ liệu từ cơ sở dữ liệu dựa trên _id
      await Course.findByIdAndDelete(CourseID);
      res.status(204).end(); // Trả về mã trạng thái 204 (No Content) khi xóa thành công
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  getClassbyCourse: async (req, res) => {
    const CourseID = req.params.idCourse;
    try {
      // Tìm các lớp thuộc về khóa học có ID tương ứng
      const classes = await Class.find({ idCourse: CourseID }).exec();
      // Render trang EJS và truyền danh sách lớp vào
      res.render('build/pages/class_management.ejs', { listClass: classes, idCourse: CourseID, user: req.user });
    } catch (error) {
      console.error('Error retrieving classes by course:', error);
      res.status(500).send('Internal Server Error');
    }
  },
  postClassByCourse: async (req, res) => {
    const CourseID = req.params.idCourse;
    const newClassData = req.body;
    try {
      newClassData.idCourse = CourseID;  // Gán CourseID vào dữ liệu lớp mới
      const createdClass = await Class.create(newClassData);
      res.status(201).json(createdClass); // Trả về dữ liệu lớp mới đã được thêm vào
    } catch (error) {
      console.error('Error adding new class:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
}