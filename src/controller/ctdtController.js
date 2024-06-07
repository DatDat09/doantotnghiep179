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
  getAllCTDT: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 5; // Số lượng item trên mỗi trang
      const skip = (page - 1) * limit;

      const results = await CTDT.find({}).skip(skip).limit(limit);
      const totalCTDTs = await CTDT.countDocuments({});
      const totalPages = Math.ceil(totalCTDTs / limit);

      return res.render('build/pages/department_management.ejs', {
        listCTDT: results,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: totalPages,
        searchQuery: '' // Thêm biến searchQuery và thiết lập giá trị mặc định
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  searchCTDTByName: async (req, res) => {
    const searchQuery = req.query.name || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    try {
      const query = { name: { $regex: searchQuery, $options: 'i' } };
      const results = await CTDT.find(query).skip(skip).limit(limit);
      const totalCTDTs = await CTDT.countDocuments(query);
      const totalPages = Math.ceil(totalCTDTs / limit);

      return res.render('build/pages/department_management.ejs', {
        listCTDT: results,
        searchQuery, // Truyền searchQuery vào view
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: totalPages
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  putEditCTDT: async (req, res) => {
    const id = req.params.id;
    const newData = req.body;

    try {
      const updatedData = await CTDT.findByIdAndUpdate(id, newData, { new: true });
      res.status(200).json(updatedData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  postNewCTDT: async (req, res) => {
    const newData = req.body;
    try {
      const createdData = await CTDT.create(newData);
      res.status(201).json(createdData); // Trả về dữ liệu mới đã được thêm vào
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  deleteACTDT: async (req, res) => {
    const id = req.params.id;

    try {
      // Xóa dữ liệu từ cơ sở dữ liệu dựa trên _id
      await CTDT.findByIdAndDelete(id);
      res.status(204).end(); // Trả về mã trạng thái 204 (No Content) khi xóa thành công
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
}