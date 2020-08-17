const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const objSchema = new Schema(
  {
    name: {
      type: String,
      maxlength: 50,
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
    details: {
      type: Object,
      default: {},
    },
  },
  {
    minimize: false,
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

objSchema.plugin(require('mongoose-paginate'));

module.exports = mongoose.model('objs', objSchema);
