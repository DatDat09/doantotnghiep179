const connection = require('../config/database')
const { getAllUsers, getUserById, updateUserById, deleteUserById } = require('../service/CRUDService')

// const connection = require('../config/database')
const User = require('../models/user')
const CTDT = require('../models/ctdt')
const Course = require('../models/course')
const Class = require('../models/class')


const getHomePage = async (req, res) => {
  let results = await User.find({});
  return res.render('home.ejs', { listUsers: results })
}

const getIndex = async (req, res) => {
  res.render('build/index.ejs')
}

const getABC = (req, res) => {
  res.send('check ABC')
}
const getEpuseca = (req, res) => {
  res.render('sample.ejs')
}
const postCreateUser = async (req, res) => {
  let email = req.body.email
  let name = req.body.myname
  let city = req.body.city

  console.log(">>email: ", email, ">>name: ", name, ">>city: ", city)
  await User.create({
    email: email,
    name: name,
    city: city
  })

  res.send('create user succed')
}


const getCreatePage = (req, res) => {
  res.render('create.ejs')
}

const getUpdatePage = async (req, res) => {
  const userId = req.params.id
  // let user = await getUserById(userId)
  let user = await User.findById(userId).exec();
  res.render('edit.ejs', { userEdit: user })
}

const postUpdateUser = async (req, res) => {
  let email = req.body.email
  let name = req.body.myname
  let city = req.body.city
  let userId = req.body.userId

  await User.updateOne({ _id: userId }, { email: email, name: name, city: city })
  res.redirect('/') // trả về home
}

const getDeleteUser = async (req, res) => {
  // res.send('OKe')
  const userId = req.params.id
  let user = await User.findById(userId).exec();
  res.render('delete.ejs', { userEdit: user })
}
const postHandleRemoveUser = async (req, res) => {
  const id = req.body.userId
  let results = await User.deleteOne({
    _id: id
  })
  console.log(">>>results: ", results)
  res.redirect('/')
}
const getData = async (req, res) => {
  function insertUserData() {
    User.insertMany([
      {
        mssv: "20192980",
        name: "Nguyễn Gia Lộc",
        email: "loc@gmail.com",
        address: "Hust1",
        sex: "male",
        role: "student",
        username: "loc.ng192980@sis.hust.edu.vn",
        password: "123456",
        description: []
      },
      {
        mssv: "20207549",
        name: "Vũ Tiến Đạt",
        email: "dat.@gmail.com",
        address: "Hust1",
        sex: "male",
        role: "student",
        username: "dat.vt207549@sis.hust.edu.vn",
        password: "123456",
        description: []
      },
      {
        mssv: "20193000",
        name: "Nguyễn Đức Mạnh",
        email: "manh@gmail.com",
        address: "Hust1",
        sex: "male",
        role: "student",
        username: "manh.nd193000@sis.hust.edu.vn",
        password: "123456",
        description: []
      },
      {
        mssv: "00000000",
        name: "admin",
        email: "admin@gmail.com",
        address: "Hust0",
        sex: "male",
        role: "admin",
        username: "admin@sis.hust.edu.vn",
        password: "123456",
        description: []
      },
      {
        mssv: "11111111",
        name: "Giáo viên 1",
        email: "giaovien1@gmail.com",
        address: "Hust2",
        sex: "female",
        role: "teacher",
        username: "teacher1@sis.hust.edu.vn",
        password: "123456",
        description: []
      },
      {
        mssv: "11111112",
        name: "Giáo viên 2",
        email: "giaovien2@gmail.com",
        address: "Hust2",
        sex: "female",
        role: "teacher",
        username: "teacher2@sis.hust.edu.vn",
        password: "123456",
        description: []
      },
    ])
  }
  function insertCTDTData() {
    CTDT.insertMany([
      {
        "name": "Hóa và Khoa học sự sống",
        "startDate": "2019",
        "endDate": "2024"
      },
      {
        "name": "Trường Cơ khí",
        "startDate": "2020",
        "endDate": "2023"
      }
      ,
      {
        "name": "Trường Điện - Điện tử",
        "startDate": "2020",
        "endDate": "2023"
      },
      {
        "name": "Trường Công nghệ thông tin và Truyền thông",
        "startDate": "2020",
        "endDate": "2023"
      },
      {
        "name": "Trường Vật liệu",
        "startDate": "2020",
        "endDate": "2023"
      }
      ,
      {
        "name": "Khoa Giáo dục Quốc phòng & An ninh",
        "startDate": "2020",
        "endDate": "2023"
      }
      ,
      {
        "name": "Khoa Lý luận Chính trị",
        "startDate": "2020",
        "endDate": "2023"
      },
      {
        "name": "Khoa Toán - Tin",
        "startDate": "2020",
        "endDate": "2023"
      },
      {
        "name": "Khoa Vật lý Kỹ thuật",
        "startDate": "2020",
        "endDate": "2023"
      },
      {
        "name": "Viện Kinh tế và Quản lý",
        "startDate": "2020",
        "endDate": "2023"
      },
      {
        "name": "Khoa Ngoại ngữ",
        "startDate": "2020",
        "endDate": "2023"
      },
      {
        "name": "Khoa Khoa học và Công nghệ Giáo dục",
        "startDate": "2020",
        "endDate": "2023"
      }
    ])
  }
  function insertCourseData() {
    Course.insertMany([
      {
        "name": "Đồ án thiết kế III",
        "maHocPhan": "ET5020",
        "tinChi": "3",
        "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
        "idCtdt": "66470331d6bf3fd847b9d7b3"
      },
      {
        "name": "Kiến trúc máy tính",
        "maHocPhan": "ET4041",
        "tinChi": "2",
        "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
        "idCtdt": "66470331d6bf3fd847b9d7b3"
      },
      {
        "name": "Phân tích và thiết kế hướng đối tượng",
        "maHocPhan": "ET4060",
        "tinChi": "3",
        "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
        "idCtdt": "66470331d6bf3fd847b9d7b3"
      },
      {
        "name": "Trí tuệ nhân tạo và ứng dụng",
        "maHocPhan": "ET4245",
        "tinChi": "3",
        "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
        "idCtdt": "66470331d6bf3fd847b9d7b3"
      },
      {
        "name": "Hệ thống nhúng và thiết kế giao tiếp nhúng",
        "maHocPhan": "ET4361",
        "tinChi": "3",
        "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
        "idCtdt": "66470331d6bf3fd847b9d7b3"
      },
      {
        "name": "Lập trình nâng cao",
        "maHocPhan": "ET4430",
        "tinChi": "3",
        "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
        "idCtdt": "66470331d6bf3fd847b9d7b3"
      },
    ])
  }
  function insertClassData() {
    Class.insertMany([
      {
        "name": "Đồ án thiết kế III",
        "malop": "123456",
        "phongHoc": "D8-102",
        "maxStudent": 10,
        "startTime": "",
        "endTime": "",
        "thu": "",
        "idCourse": "66470331d6bf3fd847b9d7b3",
        "teacherId": "66470331d6bf3fd847b9d7af"
      },
      {
        "name": "Đồ án thiết kế III",
        "malop": "123457",
        "phongHoc": "D8-103",
        "maxStudent": 11,
        "startTime": "",
        "endTime": "",
        "thu": "",
        "idCourse": "66470331d6bf3fd847b9d7b3",
        "teacherId": "66470331d6bf3fd847b9d7b0"
      },
      {
        "name": "Kiến trúc máy tính",
        "malop": "123458",
        "phongHoc": "D8-104",
        "maxStudent": 50,
        "startTime": "6h45",
        "endTime": "11h45",
        "thu": "Thứ 2",
        "idCourse": "664706f9c77b9e31bb400ddb",
        "teacherId": "66470331d6bf3fd847b9d7b0"
      },
      {
        "name": "Kiến trúc máy tính",
        "malop": "123459",
        "phongHoc": "D8-105",
        "maxStudent": 50,
        "startTime": "6h45",
        "endTime": "11h45",
        "thu": "Thứ 3",
        "idCourse": "664706f9c77b9e31bb400ddb",
        "teacherId": "66470331d6bf3fd847b9d7b0"
      },
      {
        "name": "Phân tích và thiết kế hướng đối tượng",
        "malop": "123459",
        "phongHoc": "D8-105",
        "maxStudent": 60,
        "startTime": "6h45",
        "endTime": "11h45",
        "thu": "Thứ 4",
        "idCourse": "66470331d6bf3fd847b9d7b3",
        "teacherId": "66470331d6bf3fd847b9d7b0"
      },
      {
        "name": "Phân tích và thiết kế hướng đối tượng",
        "malop": "123460",
        "phongHoc": "D8-201",
        "maxStudent": 50,
        "startTime": "6h45",
        "endTime": "11h45",
        "thu": "Thứ 5",
        "idCourse": "66470331d6bf3fd847b9d7b3",
        "teacherId": "66470331d6bf3fd847b9d7b0"
      },
      {
        "name": "Trí tuệ nhân tạo và ứng dụng",
        "malop": "123461",
        "phongHoc": "D8-202",
        "maxStudent": 80,
        "startTime": "6h45",
        "endTime": "11h45",
        "thu": "Thứ 6",
        "idCourse": "664706f9c77b9e31bb400ddd",
        "teacherId": "66470331d6bf3fd847b9d7b0"
      },
      {
        "name": "Trí tuệ nhân tạo và ứng dụng",
        "malop": "123462",
        "phongHoc": "D8-203",
        "maxStudent": 80,
        "startTime": "6h45",
        "endTime": "11h45",
        "thu": "Thứ 6",
        "idCourse": "664706f9c77b9e31bb400ddd",
        "teacherId": "66470331d6bf3fd847b9d7b0"
      },


    ])
  }
  // insertUserData()
  // insertCTDTData()
  // insertCourseData()
  // insertClassData()
  res.send('Insert complete')

}
module.exports = {
  getHomePage, getIndex, getData, getUpdatePage, getABC, getEpuseca, postCreateUser, getCreatePage, postUpdateUser, getDeleteUser, postHandleRemoveUser
}



// module.exports = {
//   getData: async (req, res) => {
//     function insertUserData() {
//       User.insertMany([
//         {
//           mssv: "20192980",
//           name: "Nguyễn Gia Lộc",
//           email: "loc@gmail.com",
//           address: "Hust1",
//           sex: "male",
//           role: "student",
//           username: "loc.ng192980@sis.hust.edu.vn",
//           password: "123456",
//           description: []
//         },
//         {
//           mssv: "20207549",
//           name: "Vũ Tiến Đạt",
//           email: "dat.@gmail.com",
//           address: "Hust1",
//           sex: "male",
//           role: "student",
//           username: "dat.vt207549@sis.hust.edu.vn",
//           password: "123456",
//           description: []
//         },
//         {
//           mssv: "20193000",
//           name: "Nguyễn Đức Mạnh",
//           email: "manh@gmail.com",
//           address: "Hust1",
//           sex: "male",
//           role: "student",
//           username: "manh.nd193000@sis.hust.edu.vn",
//           password: "123456",
//           description: []
//         },
//         {
//           mssv: "00000000",
//           name: "admin",
//           email: "admin@gmail.com",
//           address: "Hust0",
//           sex: "male",
//           role: "admin",
//           username: "admin@sis.hust.edu.vn",
//           password: "123456",
//           description: []
//         },
//         {
//           mssv: "11111111",
//           name: "Giáo viên 1",
//           email: "giaovien1@gmail.com",
//           address: "Hust2",
//           sex: "female",
//           role: "teacher",
//           username: "teacher1@sis.hust.edu.vn",
//           password: "123456",
//           description: []
//         },
//         {
//           mssv: "11111112",
//           name: "Giáo viên 2",
//           email: "giaovien2@gmail.com",
//           address: "Hust2",
//           sex: "female",
//           role: "teacher",
//           username: "teacher2@sis.hust.edu.vn",
//           password: "123456",
//           description: []
//         },
//       ])
//     }
//     function insertCTDTData() {
//       CTDT.insertMany([
//         {
//           "name": "Hóa và Khoa học sự sống",
//           "startDate": "2019",
//           "endDate": "2024"
//         },
//         {
//           "name": "Trường Cơ khí",
//           "startDate": "2020",
//           "endDate": "2023"
//         }
//         ,
//         {
//           "name": "Trường Điện - Điện tử",
//           "startDate": "2020",
//           "endDate": "2023"
//         },
//         {
//           "name": "Trường Công nghệ thông tin và Truyền thông",
//           "startDate": "2020",
//           "endDate": "2023"
//         },
//         {
//           "name": "Trường Vật liệu",
//           "startDate": "2020",
//           "endDate": "2023"
//         }
//         ,
//         {
//           "name": "Khoa Giáo dục Quốc phòng & An ninh",
//           "startDate": "2020",
//           "endDate": "2023"
//         }
//         ,
//         {
//           "name": "Khoa Lý luận Chính trị",
//           "startDate": "2020",
//           "endDate": "2023"
//         },
//         {
//           "name": "Khoa Toán - Tin",
//           "startDate": "2020",
//           "endDate": "2023"
//         },
//         {
//           "name": "Khoa Vật lý Kỹ thuật",
//           "startDate": "2020",
//           "endDate": "2023"
//         },
//         {
//           "name": "Viện Kinh tế và Quản lý",
//           "startDate": "2020",
//           "endDate": "2023"
//         },
//         {
//           "name": "Khoa Ngoại ngữ",
//           "startDate": "2020",
//           "endDate": "2023"
//         },
//         {
//           "name": "Khoa Khoa học và Công nghệ Giáo dục",
//           "startDate": "2020",
//           "endDate": "2023"
//         }
//       ])
//     }
//     function insertCourseData() {
//       Course.insertMany([
//         {
//           "name": "Đồ án thiết kế III",
//           "maHocPhan": "ET5020",
//           "tinChi": "3",
//           "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
//           "idCtdt": "66470331d6bf3fd847b9d7b3"
//         },
//         {
//           "name": "Kiến trúc máy tính",
//           "maHocPhan": "ET4041",
//           "tinChi": "2",
//           "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
//           "idCtdt": "66470331d6bf3fd847b9d7b3"
//         },
//         {
//           "name": "Phân tích và thiết kế hướng đối tượng",
//           "maHocPhan": "ET4060",
//           "tinChi": "3",
//           "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
//           "idCtdt": "66470331d6bf3fd847b9d7b3"
//         },
//         {
//           "name": "Trí tuệ nhân tạo và ứng dụng",
//           "maHocPhan": "ET4245",
//           "tinChi": "3",
//           "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
//           "idCtdt": "66470331d6bf3fd847b9d7b3"
//         },
//         {
//           "name": "Hệ thống nhúng và thiết kế giao tiếp nhúng",
//           "maHocPhan": "ET4361",
//           "tinChi": "3",
//           "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
//           "idCtdt": "66470331d6bf3fd847b9d7b3"
//         },
//         {
//           "name": "Lập trình nâng cao",
//           "maHocPhan": "ET4430",
//           "tinChi": "3",
//           "description": "BSCNKS1 (KT Điện tử)/BSCNKS2",
//           "idCtdt": "66470331d6bf3fd847b9d7b3"
//         },
//       ])
//     }
//     function insertClassData() {
//       Class.insertMany([
//         {
//           "name": "Đồ án thiết kế III",
//           "malop": "123456",
//           "phongHoc": "D8-102",
//           "maxStudent": 10,
//           "startTime": "",
//           "endTime": "",
//           "thu": "",
//           "idCourse": "66470331d6bf3fd847b9d7b3",
//           "teacherId": "66470331d6bf3fd847b9d7af"
//         },
//         {
//           "name": "Đồ án thiết kế III",
//           "malop": "123457",
//           "phongHoc": "D8-103",
//           "maxStudent": 11,
//           "startTime": "",
//           "endTime": "",
//           "thu": "",
//           "idCourse": "66470331d6bf3fd847b9d7b3",
//           "teacherId": "66470331d6bf3fd847b9d7b0"
//         },
//         {
//           "name": "Kiến trúc máy tính",
//           "malop": "123458",
//           "phongHoc": "D8-104",
//           "maxStudent": 50,
//           "startTime": "6h45",
//           "endTime": "11h45",
//           "thu": "Thứ 2",
//           "idCourse": "664706f9c77b9e31bb400ddb",
//           "teacherId": "66470331d6bf3fd847b9d7b0"
//         },
//         {
//           "name": "Kiến trúc máy tính",
//           "malop": "123459",
//           "phongHoc": "D8-105",
//           "maxStudent": 50,
//           "startTime": "6h45",
//           "endTime": "11h45",
//           "thu": "Thứ 3",
//           "idCourse": "664706f9c77b9e31bb400ddb",
//           "teacherId": "66470331d6bf3fd847b9d7b0"
//         },
//         {
//           "name": "Phân tích và thiết kế hướng đối tượng",
//           "malop": "123459",
//           "phongHoc": "D8-105",
//           "maxStudent": 60,
//           "startTime": "6h45",
//           "endTime": "11h45",
//           "thu": "Thứ 4",
//           "idCourse": "66470331d6bf3fd847b9d7b3",
//           "teacherId": "66470331d6bf3fd847b9d7b0"
//         },
//         {
//           "name": "Phân tích và thiết kế hướng đối tượng",
//           "malop": "123460",
//           "phongHoc": "D8-201",
//           "maxStudent": 50,
//           "startTime": "6h45",
//           "endTime": "11h45",
//           "thu": "Thứ 5",
//           "idCourse": "66470331d6bf3fd847b9d7b3",
//           "teacherId": "66470331d6bf3fd847b9d7b0"
//         },
//         {
//           "name": "Trí tuệ nhân tạo và ứng dụng",
//           "malop": "123461",
//           "phongHoc": "D8-202",
//           "maxStudent": 80,
//           "startTime": "6h45",
//           "endTime": "11h45",
//           "thu": "Thứ 6",
//           "idCourse": "664706f9c77b9e31bb400ddd",
//           "teacherId": "66470331d6bf3fd847b9d7b0"
//         },
//         {
//           "name": "Trí tuệ nhân tạo và ứng dụng",
//           "malop": "123462",
//           "phongHoc": "D8-203",
//           "maxStudent": 80,
//           "startTime": "6h45",
//           "endTime": "11h45",
//           "thu": "Thứ 6",
//           "idCourse": "664706f9c77b9e31bb400ddd",
//           "teacherId": "66470331d6bf3fd847b9d7b0"
//         },


//       ])
//     }
//     // insertUserData()
//     // insertCTDTData()
//     // insertCourseData()
//     // insertClassData()
//     res.send('Insert complete')
//   },

// }