const express = require('express')
const routerAPI = express.Router()
const middleware = require('../middleware/middleware')

const { getStudentAPI, getStudentByCTDTAPI, searchStudentByName, getTeachers, searchTeacher, editStudentById, getTeacherAPI, createStudent, deleteStudent, editTeacher, deleteTeacher, createTeacher }
    = require('../controller/userController')
const { getAllCTDT, searchCTDTByName, putEditCTDT, postNewCTDT, deleteACTDT, }
    = require('../controller/ctdtController')
const { getCourse, getClassbyCourse, postCourses, putCourses, deteteCourses, postClassByCourse }
    = require('../controller/courseController')
const { getClass, postClass, putClass, deteteClass, getStudentinClass, deleteStudentFromClass, addStudentToClass, createSchedule, searchStudents, getSchedule }
    = require('../controller/classController')
const { getClassExams, searchClassExamsByName, getStudentByClassExam, postClassExams, putClassExams, deleteClassExams, searchStudentsExam, addStudentToClassExam, deleteStudentFromClassExam, getAllTeachers, getAllClasses }
    = require('../controller/classExamController')
const { loginUser, getMain, Login, Logout, getProfile, dashboardController } = require('../controller/mainController')
const { getMainStudent, getCourseStudent, getClassbyCourseStudent, getClassStudent, getClassExamsS, searchClassExamsByNameS, getStudentByClassExamS, putClassStudent, getStudentinClassStudent, getProfileS, getScheduleS, deleteClassStudent } = require('../controller/studentController')
const { getMainTeacher, getCourseTeacher, getClassbyCourseTeacher, getClassTeacher, getClassExamsT, searchClassExamsByNameT, getTeacherByClassExamS, putClassTeacher, getTeacherinClassTeacher, getProfileT, getAllCTDTteacher, searchCTDTByNameT } = require('../controller/teacherController')



const { }
    = require('../controller/kqhtController')
const { } = require('../controller/homeController')

//STUDENT
routerAPI.get('/mainStudent', middleware.verifyToken, middleware.roleStudent, getMainStudent) //Trang dành cho student
routerAPI.get('/coursesStudent', middleware.verifyToken, middleware.roleStudent, getCourseStudent) //View course
routerAPI.get('/coursesStudent/:idCourse', middleware.verifyToken, middleware.roleStudent, getClassbyCourseStudent)
routerAPI.get('/classStudent', middleware.verifyToken, getClassStudent)
routerAPI.get('/classStudent/:idClass', middleware.verifyToken, getStudentinClassStudent)
routerAPI.put('/classStudentRegister', middleware.verifyToken, putClassStudent)
routerAPI.get('/classExamsStudent', middleware.verifyToken, getClassExamsS)
routerAPI.post('/classExamsS/search', middleware.verifyToken, searchClassExamsByNameS);
routerAPI.get('/classExamsStudentsS/:idClassExam', middleware.verifyToken, getStudentByClassExamS);
routerAPI.get('/profileS', middleware.verifyToken, getProfileS); //Trang cá nhân
routerAPI.get('/scheduleS', middleware.verifyToken, getScheduleS)
routerAPI.delete('/classStudentRegister/:classId', middleware.verifyToken, deleteClassStudent); // Route xóa lớp

//TEACHER
routerAPI.get('/mainTeacher', middleware.verifyToken, middleware.roleTeacher, getMainTeacher) //Trang dành cho teacher
routerAPI.get('/coursesTeacher', middleware.verifyToken, middleware.roleTeacher, getCourseTeacher) //View course
routerAPI.get('/coursesTeacher/:idCourse', middleware.verifyToken, middleware.roleTeacher, getClassbyCourseTeacher)
routerAPI.get('/classTeacher', middleware.verifyToken, getClassTeacher)
routerAPI.get('/classTeacher/:idClass', middleware.verifyToken, getTeacherinClassTeacher)
routerAPI.put('/classTeacherRegister', middleware.verifyToken, putClassTeacher)
routerAPI.get('/classExamsTeacher', middleware.verifyToken, getClassExamsT)
routerAPI.post('/classExamsT/search', middleware.verifyToken, searchClassExamsByNameT);
routerAPI.get('/classExamsTeacherS/:idClassExam', middleware.verifyToken, getTeacherByClassExamS);
routerAPI.get('/profileT', middleware.verifyToken, getProfileT); //Trang cá nhân
routerAPI.get('/ctdtsTeacher', middleware.verifyToken, getAllCTDTteacher)
routerAPI.get('/ctdtsSearchNameT', middleware.verifyToken, searchCTDTByNameT);
routerAPI.get('/scheduleT', middleware.verifyToken, getSchedule)

///ADMIN
//Trang chủ
routerAPI.get('/main', middleware.verifyToken, getMain) //Trang dành cho admin
routerAPI.get('/', Login) //Render ra trang login đầu
routerAPI.post('/login', loginUser); //check login
routerAPI.get('/logout', Logout); //clear token
routerAPI.get('/profile', middleware.verifyToken, getProfile); //Trang cá nhân


//Khoa viện
routerAPI.get('/ctdts', middleware.verifyToken, getAllCTDT) //Hiển thị tất cả ctdts
routerAPI.get('/ctdtsSearchName', middleware.verifyToken, searchCTDTByName); //search theo tên ctdt
routerAPI.put('/ctdts/:id', middleware.verifyToken, putEditCTDT); // PUT route to update data
routerAPI.post('/ctdts', middleware.verifyToken, postNewCTDT); // Route để xử lý yêu cầu thêm mới dữ liệu
routerAPI.delete('/ctdts/:id', middleware.verifyToken, deleteACTDT);// Route để xử lý yêu cầu xóa dữ liệu dựa trên _id



///User
//Sinh viên
routerAPI.get('/students', middleware.verifyToken, getStudentAPI) //hiển thị trang ctdts để hiển thị sinh viên
routerAPI.get('/students/ctdts', middleware.verifyToken, getStudentByCTDTAPI) //vào trang của ctdt xong sẽ có ds sinh viên
routerAPI.get('/studentSearchName', middleware.verifyToken, searchStudentByName); //search tên sinh viên
routerAPI.put('/students/:id', middleware.verifyToken, editStudentById)
routerAPI.post('/student', middleware.verifyToken, createStudent)
routerAPI.delete('/student/:id', middleware.verifyToken, deleteStudent)
// Giáo viên
routerAPI.get('/teachers/ctdts', middleware.verifyToken, getTeachers)
routerAPI.get('/teacherSearch', middleware.verifyToken, searchTeacher)
routerAPI.get('/teachers', middleware.verifyToken, getTeacherAPI)
routerAPI.put('/teachers/:id', editTeacher)
routerAPI.delete('/teachers/:id', deleteTeacher)
routerAPI.post('/teachers', createTeacher)

//Khóa học
routerAPI.get('/courses', middleware.verifyToken, getCourse)
routerAPI.get('/courses/:idCourse', middleware.verifyToken, getClassbyCourse)
routerAPI.post('/courses', postCourses)
routerAPI.put('/courses/:idCourse', putCourses)
routerAPI.delete('/courses/:idCourse', deteteCourses)
routerAPI.post('/courses/:idCourse', middleware.verifyToken, postClassByCourse);

//Lớp học
routerAPI.post('/create-schedule', createSchedule);
routerAPI.post('/class/:classId/student/:studentId', middleware.verifyToken, addStudentToClass);
routerAPI.delete('/class/:classId/student/:studentId', middleware.verifyToken, deleteStudentFromClass);
routerAPI.get('/class/:idClass', middleware.verifyToken, getStudentinClass)
routerAPI.get('/:idClass/search-students', searchStudents);
routerAPI.get('/class', middleware.verifyToken, getClass)
routerAPI.post('/class', postClass)
routerAPI.put('/class/:idClass', putClass)
routerAPI.delete('/class/:idClass', deteteClass)

routerAPI.get('/schedule', middleware.verifyToken, getSchedule)


//Lớp thi
routerAPI.get('/:idClassExam/search-students', searchStudentsExam);
routerAPI.post('/classExam/:idClassExam/student/:studentId', middleware.verifyToken, addStudentToClassExam);
routerAPI.delete('/classExam/:idClassExam/student/:studentId', middleware.verifyToken, deleteStudentFromClassExam);

routerAPI.get('/classExams', middleware.verifyToken, getClassExams)
routerAPI.post('/classExams/search', middleware.verifyToken, searchClassExamsByName);
routerAPI.get('/classExamsStudents/:idClassExam', middleware.verifyToken, getStudentByClassExam);
routerAPI.post('/classExams', middleware.verifyToken, postClassExams)
routerAPI.put('/classExams/:id', middleware.verifyToken, putClassExams)
routerAPI.delete('/classExams/:idClassExam', middleware.verifyToken, deleteClassExams)
routerAPI.get('/allTeachers', getAllTeachers);
routerAPI.get('/allClasses', getAllClasses);

//Điểm danh lớp thi

const faceController = require('../controller/faceController');
const classController = require('../controller/classController')
routerAPI.post('/post-face', faceController.postFace);
routerAPI.post('/check-face', faceController.checkFace);
routerAPI.get('/faceCheckAttend', faceController.renderForm);
routerAPI.get('/faceCheckAttend/:idClassExam', faceController.renderForm);
routerAPI.post('/check-face/:idClassExam', faceController.checkFaceByClassExam);
routerAPI.get('/get-recognized-name/:userId', faceController.getFaceByName);
routerAPI.get('/faceCheckAttend1/:idClassExam', faceController.renderForm1);


module.exports = routerAPI;