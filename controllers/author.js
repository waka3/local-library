const Author = require('../models/author');
const Book = require('../models/book');
const async = require('async');

exports.author_list = function (req, res, next) {
  Author.find().sort([['family_name', 'ascending']]).exec(function (err, list_authors) {
    if (err) {
      return next(err)
    }
    let data = {
      title: 'Author list',
      author_list: list_authors
    }
    res.render('../views/author/author_list', data)
  })
}

exports.author_detail = function (req, res, next) {
  async.parallel({
    author: function (callback) {
      Author.findById(req.params.id).exec(callback)
    },
    author_books: function (callback) {
      Book.find({ 'author': req.params.id }, 'title summary').exec(callback)
    }
  }, function (err, results) {
    if (err) {
      return next(err)
    }
    if (results.author === null) {
      var err = new Error('Author not found');
      err.status = 404;
      return next(err)
    }
    let data = {
      title: 'author_detail',
      author: results.author,
      author_books: results.author_books
    }
    res.render('../views/author/author_detail.pug', data);
  })
}

exports.author_create_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Author create GET');
}

exports.author_create_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Author create POST');
}

exports.author_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Author delete GET');
}

exports.author_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Author delete POST');
}

exports.author_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Author update GET');
}

exports.author_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Author update POSt');
}
