const express = require('express')
const routerAPI = express.Router()

const { getUsersAPI, getStudentByCTDTAPI, getStudentAPI, postCreateUserAPI, putUpdateUserAPI, deleteUserAPI, getUserAPIById, loginUser, registerUser }
  = require('../controller/userController')

const { postCreateCTDT, getAllCTDT, deleteCTDT, updateCTDT }
  = require('../controller/ctdtController')

const { postCreateCourse, getAllCourse, deleteCourse, updateCourse }
  = require('../controller/courseController')

const { postCreateClass, getAllClass, deleteClass, updateClass }
  = require('../controller/classController')

const { postCreateClassExam, getAllClassExam, deleteClassExam, updateClassExam }
  = require('../controller/classExamController')

const { postCreateKqht, getAllKqht, deleteKqht, updateKqht }
  = require('../controller/kqhtController')

const middleware = require('../middleware/middleware')

const { getHomePage, getData } = require('../controller/homeController')
routerAPI.get('/', getHomePage)
routerAPI.get('/data', getData)

routerAPI.get('/students', getStudentAPI)
routerAPI.get('/students/ctdts', getStudentByCTDTAPI)
routerAPI.get('/users', getUsersAPI)
routerAPI.get('/users/:iduser', getUserAPIById)
routerAPI.post('/users', postCreateUserAPI)
routerAPI.put('/users', putUpdateUserAPI)
routerAPI.delete('/users', deleteUserAPI)

routerAPI.post('/ctdts', postCreateCTDT)
routerAPI.get('/ctdts', getAllCTDT)
routerAPI.delete('/ctdts', deleteCTDT)
routerAPI.put('/ctdts', updateCTDT)

routerAPI.post('/course', postCreateCourse)
routerAPI.get('/course', getAllCourse)
routerAPI.delete('/course', deleteCourse)
routerAPI.put('/course', updateCourse)

routerAPI.post('/classes', postCreateClass)
routerAPI.get('/classes', getAllClass)
routerAPI.delete('/classes', deleteClass)
routerAPI.put('/classes', updateClass)

routerAPI.post('/class-exam', postCreateClassExam)
routerAPI.get('/class-exam', getAllClassExam)
routerAPI.delete('/class-exam', deleteClassExam)
routerAPI.put('/class-exam', updateClassExam)

routerAPI.post('/kqht', postCreateKqht)
routerAPI.get('/kqht', getAllKqht)
routerAPI.delete('/kqht', deleteKqht)
routerAPI.put('/kqht', updateKqht)

routerAPI.post('/login', loginUser)
routerAPI.get('/profile', middleware.verifyToken, middleware.roleAdmin, async (req, res) => {
  return res.json({
    info: req.user
  })
});

const { getMain }
  = require('../controller/mainController')
routerAPI.get('/main', getMain)




module.exports = routerAPI;