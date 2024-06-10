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
async function getStudentsArray(idClass) {
  // Fetch students array based on class ID
  const classData = await Class.findById(idClass).populate('idStudents');
  if (!classData) {
    return [];
  }

  // Create a map to store unique students
  const uniqueStudents = new Map();
  classData.idStudents.forEach(student => {
    uniqueStudents.set(student._id.toString(), { ...student._doc, inClass: true, attended: false });
  });

  // Convert unique students map to array
  const studentsArray = Array.from(uniqueStudents.values());
  return studentsArray;
}
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
      const currentPage = parseInt(req.query.page) || 1;
      const itemsPerPage = parseInt(req.query.limit) || 5;

      // Find the class data including the students
      const classData = await Class.findById(idClass).populate('idStudents');
      if (!classData) {
        return res.status(404).send("Class not found");
      }

      // Create a map to store unique students
      const uniqueStudents = new Map();
      classData.idStudents.forEach(student => {
        uniqueStudents.set(student._id.toString(), { ...student._doc, inClass: true, attended: false });
      });

      const totalStudents = uniqueStudents.size;
      const totalPages = Math.ceil(totalStudents / itemsPerPage);

      // Paginate the students
      const studentsArray = Array.from(uniqueStudents.values());
      const paginatedStudents = studentsArray.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

      // Find all users with role 'student' (Assuming this is where listUserByCTDT comes from)
      const allStudents = await User.find({ role: 'student' });

      // Mark students who are already in the class
      allStudents.forEach(student => {
        if (uniqueStudents.has(student._id.toString())) {
          student.inClass = true;
        } else {
          student.inClass = false;
        }
      });

      // Render the template with the data
      res.render('build/pages/listStudentAD.ejs', {
        listStudentByClass: paginatedStudents,
        listUserByCTDT: allStudents,
        classId: idClass,
        totalPages: totalPages,
        currentPage: currentPage
      });
    } catch (error) {
      console.error("Error fetching class data:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  ,
  searchStudents: async (req, res) => {
    try {
      const { idClass } = req.params;
      const currentPage = parseInt(req.query.page) || 1;
      const itemsPerPage = parseInt(req.query.limit) || 5;
      const searchInputCode = req.query.mssv || ''; // Lấy mã sinh viên từ query string
      const searchInputName = req.query.name || ''; // Lấy tên sinh viên từ query string

      // Find the class data including the students
      const classData = await Class.findById(idClass).populate('idStudents');
      if (!classData) {
        return res.status(404).send("Class not found");
      }

      // Filter students based on search criteria (mã sinh viên và tên sinh viên)
      const filteredStudents = classData.idStudents.filter(student => {
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
      res.render('build/pages/listStudentAD.ejs', {
        listStudentByClass: paginatedStudents,
        listUserByCTDT: allStudents,
        classId: idClass,
        totalPages: totalPages,
        currentPage: currentPage
      });
    } catch (error) {
      console.error("Error searching for students:", error);
      res.status(500).send("Internal Server Error");
    }
  },


  addStudentToClass: async (req, res) => {
    try {
      const { classId, studentId } = req.params;
      let classData = await Class.findById(classId);

      if (!classData) {
        return res.status(404).send("Class not found");
      }

      if (!classData.idStudents.includes(studentId)) {
        classData.idStudents.push(studentId);
        await classData.save();
      }

      res.status(200).send("Student added to class");
    } catch (error) {
      console.error("Error adding student to class:", error);
      res.status(500).send("Internal Server Error");
    }
  },



  deleteStudentFromClass: async (req, res) => {
    const { classId, studentId } = req.params;

    try {
      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        { $pull: { idStudents: studentId } },
        { new: true }
      );

      if (!updatedClass) {
        return res.status(404).json({ message: 'Class not found' });
      }

      res.status(200).json({ message: 'Student removed from class', updatedClass });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  createSchedule: async (req, res) => {
    try {
      const classes = await Class.find({ processed: false }).sort({ malop: 1 }); // Lấy ra các lớp chưa được xử lý
      const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu']; // Các ngày trong tuần từ Thứ Hai đến Thứ Sáu
      let startHour = 6; // Giờ bắt đầu từ 6:45 sáng
      let endHour = 20; // Giờ kết thúc là 20:00 tối
      const maxDurationPerDay = 3; // Thời gian tối đa cho mỗi môn học trong một ngày (tính bằng giờ)

      let currentDayIndex = 0; // Index của ngày hiện tại (bắt đầu từ Thứ Hai)

      for (let cls of classes) {
        const duration = calculateDuration(cls); // Tính thời gian mỗi lớp học

        if (startHour + duration <= endHour && duration <= maxDurationPerDay) { // Kiểm tra xem lớp học có thể kết thúc trước 20:00 và không vượt quá thời gian tối đa trên mỗi ngày không
          cls.startTime = formatTime(startHour); // Format thời gian bắt đầu
          cls.endTime = formatTime(startHour + duration); // Format thời gian kết thúc
          cls.thu = days[currentDayIndex]; // Gán ngày học

          // Cập nhật thời gian cho ngày tiếp theo
          startHour += duration;
        } else { // Nếu không thể, chuyển sang ngày học tiếp theo
          startHour = 6; // Reset giờ bắt đầu cho ngày mới
          currentDayIndex++;
          cls.startTime = formatTime(startHour); // Format thời gian bắt đầu
          cls.endTime = formatTime(startHour + duration); // Format thời gian kết thúc
          cls.thu = days[currentDayIndex]; // Gán ngày học

          // Cập nhật thời gian cho ngày tiếp theo
          startHour += duration;
        }

        cls.processed = true; // Đánh dấu lớp đã được xử lý
        await cls.save();
      }

      res.send('Lịch học đã được tạo thành công.');
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
}
function calculateDuration(cls) {
  // Tính độ dài của lớp học, có thể tính dựa trên số lượng học viên hoặc cách khác
  // Đây là một ví dụ đơn giản, bạn có thể điều chỉnh theo yêu cầu cụ thể
  const baseDuration = 2; // Mỗi lớp học mặc định kéo dài 2 tiếng
  const additionalTimePerStudent = 0.5; // Thời gian thêm cho mỗi học viên, ví dụ 0.5 tiếng

  const additionalTime = cls.idStudents.length * additionalTimePerStudent;
  return baseDuration + additionalTime;
}

function formatTime(hour) {
  const hourPart = Math.floor(hour);
  const minutePart = hour % 1 === 0.5 ? '30' : '00'; // Nếu phần phút là 0.5, sử dụng '30', nếu không, sử dụng '00'
  return `${hourPart}:${minutePart}`;
}