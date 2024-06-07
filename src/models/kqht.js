const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');

// const ctdtSchema = new mongoose.Schema({
//   name: String,
// });

const kqhtSchema = new mongoose.Schema(
  {
    idClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'class',
      required: true, // Enforce a required class association
      // unique: true // Ensure a one-to-one relationship
    },
    idKqhtStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true, // Enforce a required class association
      // unique: true // Ensure a one-to-one relationship
    },
    diemQT: String,
    diemCK: String,
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Override all methods
kqhtSchema.plugin(mongoose_delete, { overrideMethods: 'all' });

const Kqht = mongoose.model('kqht', kqhtSchema);

module.exports = Kqht;

