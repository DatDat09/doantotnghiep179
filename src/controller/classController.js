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
  getClass: async (req, res) => {
    try {
      const currentPage = parseInt(req.query.page) || 1;
      const itemsPerPage = 5;
      const searchCode = req.query.mhp || '';
      const searchName = req.query.thp || '';

      let query = {};
      if (searchCode) {
        query.malop = { $regex: searchCode, $options: 'i' };
      }
      if (searchName) {
        query.name = { $regex: searchName, $options: 'i' };
      }

      const totalItems = await Class.countDocuments(query);
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      const myClass = await Class.find(query)
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage);
      let results = await Class.find({});
      res.render('build/pages/class_management', {

        listClass: myClass,
        totalPages: totalPages,
        currentPage: currentPage,
        searchCode: searchCode,
        searchName: searchName,
        listClassByCourse: results
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi máy chủ');
    }
  },


  postClass: async (req, res) => {
    const newData = req.body;
    try {
      const createdData = await Class.create(newData);
      res.status(201).json(createdData); // Trả về dữ liệu mới đã được thêm vào
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  putClass: async (req, res) => {
    const ClassID = req.params.idClass;
    const newData = req.body;
    try {
      const updatedData = await Class.findByIdAndUpdate(ClassID, newData, { new: true });
      res.status(200).json(updatedData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  deteteClass: async (req, res) => {
    const ClassID = req.params.idClass;

    try {
      // Xóa dữ liệu từ cơ sở dữ liệu dựa trên _id
      await Class.findByIdAndDelete(ClassID);
      res.status(204).end(); // Trả về mã trạng thái 204 (No Content) khi xóa thành công
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  getStudentinClass: async (req, res) => {
    try {
      const { idClass } = req.params;
      let classData = await Class.findById(idClass).populate('idStudents');
      if (!classData) {
        return res.status(404).send("Class not found");
      }

      // Tạo danh sách sinh viên duy nhất và đánh dấu trạng thái
      let uniqueStudents = new Map();

      classData.idStudents.forEach(student => {
        uniqueStudents.set(student._id.toString(), { ...student._doc, inClass: true, attended: false });
      });



      return res.render('build/pages/listStudentAD.ejs', {
        listStudentByClass: Array.from(uniqueStudents.values())
      });
    } catch (error) {
      console.error("Error fetching class  data:", error);
      return res.status(500).send("Internal Server Error");
    }
  },
}

