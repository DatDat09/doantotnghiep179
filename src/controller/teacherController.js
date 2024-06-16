const { bcryptUtil } = require("../config/hash")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const CTDT = require('../models/ctdt')
const User = require('../models/user')
const Course = require("../models/course")
const Class = require("../models/class")
const ClassExam = require("../models/classExam")
const classExam = require("../models/classExam")

module.exports = {
    getMainTeacher: async (req, res) => {
        res.render('build/teacher/index3.ejs', {
            user: req.user
        });
    },
    getCourseTeacher: async (req, res) => {
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

            res.render('build/teacher/course_management3.ejs', {
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
    getClassbyCourseTeacher: async (req, res) => {
        const CourseID = req.params.idCourse;
        let results = await Class.find({ idCourse: CourseID }).exec();
        return res.render('build/teacher/class_management3.ejs', { listClass: results, user: req.user })
    },
    getClassTeacher: async (req, res) => {
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
            res.render('build/teacher/class_management3.ejs', {

                listClass: myClass,
                totalPages: totalPages,
                currentPage: currentPage,
                searchCode: searchCode,
                searchName: searchName,
                listClassByCourse: results,
                user: req.user
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi máy chủ');
        }
    },
    getTeacherinClassTeacher: async (req, res) => {
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
            const results = await User.find({ role: 'student' });

            // Đánh dấu trạng thái sinh viên đã có trong lớp
            results.forEach(user => {
                if (uniqueStudents.has(user._id.toString())) {
                    user.inClass = true;
                } else {
                    user.inClass = false;
                }
            });


            return res.render('build/teacher/classTeacher_management3.ejs', {
                listStudentByClass: Array.from(uniqueStudents.values()), listUserByCTDT: results,
                classId: idClass // Pass classId to the template
            });
        } catch (error) {
            console.error("Error fetching class  data:", error);
            return res.status(500).send("Internal Server Error");
        }
    },
    putClassTeacher: async (req, res) => {
        try {
            const classId = req.body.classId;
            const userId = req.user.id; // Assuming the token payload contains the user ID
            // console.log("userId: ",userId)

            const classDoc = await Class.findById(classId);
            if (!classDoc) {
                return res.status(404).json({ message: 'Class not found' });
            }

            // Check if the user is already registered
            if (classDoc.idTeachers.includes(userId)) {
                return res.status(400).json({ message: 'User already registered in this class' });
            }

            // Add the user to the idStudents array
            classDoc.idTeachers.push(userId);
            await classDoc.save();

            res.status(200).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Failed to register user' });
        }
    },
    getClassExamsT: async (req, res) => {
        try {
            let results = await ClassExam.find({})
                .populate({
                    path: 'classId',
                    populate: {
                        path: 'idCourse', // Populate idCourse from class
                        model: 'course' // Ensure the model is correct
                    }
                })
                .populate({
                    path: 'teacherId', // Populate teacherId to get teacher details
                    select: 'name' // Only select the 'name' field from the user document
                });


            return res.render('build/teacher/classexams_management3.ejs', { listClassExam: results, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
    searchClassExamsByNameT: async (req, res) => {
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

    getTeacherByClassExamS: async (req, res) => {
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

            return res.render('build/teacher/listStudentInClassExam3.ejs', {
                listStudentByClassExam: Array.from(uniqueStudents.values())
            });
        } catch (error) {
            console.error("Error fetching class exam data:", error);
            return res.status(500).send("Internal Server Error");
        }
    },
    getProfileT: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).populate('idCtdt').exec();

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Construct image path based on mssv and stored image filename
            const imagePath = user.image ? `/img/avt/${user.image}` : '/img/avt/default.jpg';

            res.render('build/teacher/profileT.ejs', {
                user: user,
                imagePath: imagePath
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    getAllCTDTteacher: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 5; // Số lượng item trên mỗi trang
            const skip = (page - 1) * limit;

            const results = await CTDT.find({}).skip(skip).limit(limit);
            const totalCTDTs = await CTDT.countDocuments({});
            const totalPages = Math.ceil(totalCTDTs / limit);

            return res.render('build/teacher/department_management3.ejs', {
                listCTDT: results,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: totalPages,
                searchQuery: '', // Thêm biến searchQuery và thiết lập giá trị mặc định
                user: req.user
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    searchCTDTByNameT: async (req, res) => {
        const searchQuery = req.query.name || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        try {
            const query = { name: { $regex: searchQuery, $options: 'i' } };
            const results = await CTDT.find(query).skip(skip).limit(limit);
            const totalCTDTs = await CTDT.countDocuments(query);
            const totalPages = Math.ceil(totalCTDTs / limit);

            return res.render('build/teacher/department_management3.ejs', {
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
}