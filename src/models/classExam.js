const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');


// const classSchema = new mongoose.Schema({
//   name: String,
// });
// const teacherSchema = new mongoose.Schema({
//   name: String,
// }); 

const classExamSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'class', default: null },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    maHocPhan: String,
    ngayThi: String,
    kipThi: String,
    phongThi: String,
    maxStudent: Number,
    idStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    idStudentsDiemDanh: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    startTime: {
      type: Date,
      default: Date.now()
    },
    endTime: {
      type: Date,
      default: Date.now()
    },
  }
);

// Override all methods
classExamSchema.plugin(mongoose_delete, { overrideMethods: 'all' });

const classExam = mongoose.model('classExam', classExamSchema);

module.exports = classExam;

