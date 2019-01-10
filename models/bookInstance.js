const moment = require('moment');
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BookInstanceSchema = new Schema({
  book: {
    type: Schema.ObjectId,
    ref: 'Book',
    required: true
  },
  imprint: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    // 可借的, 维护中, 已借出, 已被预订
    enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
    default: 'Maintenance'
  },
  due_back: {
    type: Date,
    default: Date.now
  }
});

BookInstanceSchema.virtual('url').get(function () {
  return '/catalog/bookinstance/' + this._id;
});
BookInstanceSchema.virtual('due_back_formatted').get(function () {
  return moment(this.due_back).format('YYYY-MM-DD hh:mm:ss')
});

//Export model
module.exports = mongoose.model('bookInstance', BookInstanceSchema);