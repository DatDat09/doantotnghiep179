const { bcryptUtil } = require("../config/hash")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { createUser, postUploadImg, getUser, uUser, dUser, getUserById, getUserByUsername }
  = require("../service/userService")

const { uploadSingleFile } = require("../service/userService")

const CTDT = require('../models/ctdt')
const User = require('../models/user')
const Course = require("../models/course")
const Class = require("../models/class")
const ClassExam = require("../models/classExam")
const classExam = require("../models/classExam")


module.exports = {
  getStudentAPI: async (req, res) => {
    let results = await CTDT.find({});
    return res.render('build/pages/student_management', { listCTDT: results })
  },
  getStudentByCTDTAPI: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 6; // Số lượng item trên mỗi trang
      const skip = (page - 1) * limit;

      const results = await User.find({ role: 'student' }).skip(skip).limit(limit);
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalPages = Math.ceil(totalStudents / limit);

      res.render('build/pages/listStudent', { listUserByCTDT: results, totalPages, currentPage: page });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  searchStudentByName: async (req, res) => {
    const searchName = req.query.name || '';
    const searchMSSV = req.query.mssv || '';
    try {
      // Tạo truy vấn tìm kiếm
      const query = { role: 'student' };
      if (searchName) {
        query.name = { $regex: searchName, $options: 'i' };
      }
      if (searchMSSV) {
        query.mssv = { $regex: searchMSSV, $options: 'i' };
      }

      // Phân trang
      const page = parseInt(req.query.page) || 1;
      const limit = 6;
      const skip = (page - 1) * limit;

      // Lấy tài liệu khớp với phân trang
      const results = await User.find(query).skip(skip).limit(limit);
      const totalStudents = await User.countDocuments(query);
      const totalPages = Math.ceil(totalStudents / limit);

      return res.render('build/pages/listStudent.ejs', {
        listUserByCTDT: results,
        searchQuery: { name: searchName, mssv: searchMSSV },
        totalPages,
        currentPage: page
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  getTeachers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 6; // Số lượng item trên mỗi trang
      const skip = (page - 1) * limit;

      const results = await User.find({ role: 'teacher' }).skip(skip).limit(limit);
      const totalTeachers = await User.countDocuments({ role: 'teacher' });
      const totalPages = Math.ceil(totalTeachers / limit);

      res.render('build/pages/listLeturer.ejs', { listUserByCTDT: results, totalPages, currentPage: page });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  getTeacherAPI: async (req, res) => {
    let results = await CTDT.find({});
    return res.render('build/pages/lecturer_management', { listCTDT: results })
  },
  searchTeacher: async (req, res) => {
    const searchQuery = req.query.name || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
      // Tìm giảng viên theo tên với phân trang
      const query = {
        role: 'teacher',
        name: { $regex: searchQuery, $options: 'i' }
      };
      const results = await User.find(query).skip(skip).limit(limit);
      const totalTeachers = await User.countDocuments(query);
      const totalPages = Math.ceil(totalTeachers / limit);

      return res.render('build/pages/listLeturer', {
        listUserByCTDT: results,
        searchQuery,
        currentPage: page,
        totalPages
      });
    } catch (error) {
      console.error("Error searching for teachers:", error);
      return res.status(500).send("Internal Server Error");
    }
  },
  editStudentById: async (req, res) => {
    const id = req.params.id;
    const newData = req.body;

    try {
      const updatedData = await User.findByIdAndUpdate(id, newData, { new: true });
      res.status(200).json(updatedData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  createStudent: async (req, res) => {
    const newData = req.body;
    newData.role = 'student'
    try {
      const createdData = await User.create(newData);
      res.status(201).json(createdData); // Trả về dữ liệu mới đã được thêm vào
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  deleteStudent: async (req, res) => {
    const id = req.params.id;

    try {
      // Xóa dữ liệu từ cơ sở dữ liệu dựa trên _id
      await User.findByIdAndDelete(id);
      res.status(204).end(); // Trả về mã trạng thái 204 (No Content) khi xóa thành công
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  editTeacher: async (req, res) => {
    const id = req.params.id;
    const newData = req.body;
    // Đảm bảo newData.role được đặt thành 'teacher'
    newData.role = 'teacher';
    try {
      const updatedData = await User.findByIdAndUpdate(id, newData, { new: true });
      if (!updatedData) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(updatedData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  deleteTeacher: async (req, res) => {
    const id = req.params.id;

    try {
      // Xóa dữ liệu từ cơ sở dữ liệu dựa trên _id
      await User.findOneAndDelete({ _id: id });
      res.status(204).end(); // Trả về mã trạng thái 204 (No Content) khi xóa thành công
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  createTeacher: async (req, res) => {
    const newData = req.body;
    newData.role = 'teacher'
    try {
      const createdData = await User.create(newData);
      res.status(201).json(createdData); // Trả về dữ liệu mới đã được thêm vào
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
}



