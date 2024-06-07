const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');


const classStudentSchema = new mongoose.Schema(
  {
    idStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    idClass: { type: mongoose.Schema.Types.ObjectId, ref: 'class' },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
classStudentSchema.plugin(mongoose_delete, { overrideMethods: 'all' });

const ClassStudent = mongoose.model('classstudent', classStudentSchema);

module.exports = ClassStudent;

