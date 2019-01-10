const moment = require('moment');
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AuthorSchema = new Schema({
  first_name: {
    type: String, require: true, max: 100
  },
  family_name: {
    type: String, require: true, max: 100
  },
  date_of_birth: Date,
  data_of_death: Date
});

AuthorSchema.virtual('name').get(function () {
  return this.family_name + ',' + this.first_name;
});
AuthorSchema.virtual('url').get(function () {
  return '/catalog/author/' + this._id;
});
AuthorSchema.virtual('due_date_of_birth').get(function () {
  return moment(this.date_of_birth).format('YYYY-MM-DD hh:mm:ss');
});
AuthorSchema.virtual('due_data_of_death').get(function () {
  return moment(this.data_of_death).format('YYYY-MM-DD hh:mm:ss');
});

module.exports = mongoose.model('Author', AuthorSchema);