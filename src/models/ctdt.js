const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');


const ctdtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    startDate: String,
    endDate: String,
    description: {
      type: String,
      default: "Đại học Bách Khoa Hà Nội" // Set default value here
    },
    // idCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'course' }],
    lecturers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);


// Override all methods
ctdtSchema.plugin(mongoose_delete, { overrideMethods: 'all' });

const CTDT = mongoose.model('CTDT', ctdtSchema);

module.exports = CTDT;

