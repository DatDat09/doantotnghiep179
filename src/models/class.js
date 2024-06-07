const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');


const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    malop: { type: String, required: true },
    phongHoc: String,
    maxStudent: Number,
    startTime: String,
    endTime: String,
    thu: String,
    idCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'course' },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    idStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
classSchema.plugin(mongoose_delete, { overrideMethods: 'all' });

const Class = mongoose.model('class', classSchema);

module.exports = Class;

