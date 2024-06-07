const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');



const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    hocKy: {
      type: String,
      default: "20232" // Set default value here
    },
    maHocPhan: String,
    tinChi: String,
    description: String,
    idCtdt: { type: mongoose.Schema.Types.ObjectId, ref: 'CTDT' },
    // idClass: [{ type: mongoose.Schema.Types.ObjectId, ref: 'class' }],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
courseSchema.plugin(mongoose_delete, { overrideMethods: 'all' });

const Course = mongoose.model('course', courseSchema);

module.exports = Course;

