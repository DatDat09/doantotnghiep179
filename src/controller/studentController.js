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
    getMainStudent: async (req, res) => {
        try {
            const userId = req.user.id;
            const studentClasses = await Class.find({ idStudents: userId });

            res.render('build/student/index2.ejs', {
                user: req.user,
                classes: studentClasses
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi máy chủ');
        }
    },
    getCourseStudent: async (req, res) => {
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

            res.render('build/student/course_management2.ejs', {
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
    getClassbyCourseStudent: async (req, res) => {
        const CourseID = req.params.idCourse;
        let results = await Class.find({ idCourse: CourseID }).exec();
        return res.render('build/student/class_management2.ejs', { listClass: results, user: req.user })
    },
    getClassStudent: async (req, res) => {
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
            res.render('build/student/class_management2.ejs', {

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
    getStudentinClassStudent: async (req, res) => {
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



            return res.render('build/student/classStudent_management2.ejs', {
                listStudentByClass: Array.from(uniqueStudents.values())
            });
        } catch (error) {
            console.error("Error fetching class  data:", error);
            return res.status(500).send("Internal Server Error");
        }
    },
    putClassStudent: async (req, res) => {
        try {
            const classId = req.body.classId;
            const userId = req.user.id;

            const classDoc = await Class.findById(classId);
            if (!classDoc) {
                return res.status(404).json({ message: 'Class not found' });
            }

            if (classDoc.idStudents.includes(userId)) {
                return res.status(400).json({ message: 'Bạn đã có trong lớp này!!' });
            }

            classDoc.idStudents.push(userId);
            await classDoc.save();

            // Lấy danh sách lớp cập nhật cho sinh viên
            // const studentClasses = await Class.find({ idStudents: userId });

            // Chuyển hướng đến trang thời khóa biểu đã cập nhật
            res.status(200).json({ message: 'Đăng kí thành công', class: classDoc }); // Điều hướng đến route hiển thị thời khóa biểu
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Failed to register user' });
        }
    },
    deleteClassStudent: async (req, res) => {
        try {
            const classId = req.params.classId;
            const userId = req.user.id; // Assuming the token payload contains the user ID

            const classDoc = await Class.findById(classId);
            if (!classDoc) {
                return res.status(404).json({ message: 'Class not found' });
            }

            // Kiểm tra nếu sinh viên đã đăng ký lớp này
            if (!classDoc.idStudents.includes(userId)) {
                return res.status(400).json({ message: 'User not registered in this class' });
            }

            // Xóa sinh viên khỏi mảng idStudents
            classDoc.idStudents = classDoc.idStudents.filter(id => id.toString() !== userId);
            await classDoc.save();

            res.status(200).json({ message: 'Class unregistered successfully' });
        } catch (error) {
            console.error('Error unregistering class:', error);
            res.status(500).json({ message: 'Failed to unregister class' });
        }
    },
    // getStudentSchedule: async (req, res) => {
    //     try {
    //         const userId = req.user.id;
    //         const studentClasses = await Class.find({ idStudents: userId }).sort({ thu: 1, startTime: 1 });

    //         res.render('build/student/schedule2.ejs', { classes: studentClasses });
    //     } catch (error) {
    //         console.error("Error fetching student schedule:", error);
    //         res.status(500).send("Internal Server Error");
    //     }
    // },
    getClassExamsS: async (req, res) => {
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


            return res.render('build/student/classexams_management2.ejs', { listClassExam: results, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
    searchClassExamsByNameS: async (req, res) => {
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

    getStudentByClassExamS: async (req, res) => {
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

            return res.render('build/student/listStudentInClassExam2.ejs', {
                listStudentByClassExam: Array.from(uniqueStudents.values())
            });
        } catch (error) {
            console.error("Error fetching class exam data:", error);
            return res.status(500).send("Internal Server Error");
        }
    },
    getProfileS: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).populate('idCtdt').exec();

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Construct image path based on mssv and stored image filename
            const imagePath = user.image ? `/img/avt/${user.image}` : '/img/avt/default.jpg';

            res.render('build/student/profileS.ejs', {
                user: user,
                imagePath: imagePath
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    getScheduleS: async (req, res) => {
        try {
            const userId = req.user.id;
            const studentClasses = await Class.find({ idStudents: userId }).sort({ thu: 1, startTime: 1 });

            res.render('build/student/schedule2.ejs', { classes: studentClasses });
        } catch (error) {
            console.error("Error fetching student schedule:", error);
            res.status(500).send("Internal Server Error");
        }
    },
}