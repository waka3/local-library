const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var genreSchema = new Schema({
  name: {
    type: String
  }
});

genreSchema.virtual('url').get(function () {
  return '/catalog/genre/' + this._id;
});

module.exports = mongoose.model('Genre', genreSchema);