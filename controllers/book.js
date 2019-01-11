const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookInstance');
const path = require('path');
const fs = require('fs');
const pug = require('pug');
const async = require('async');
const request = require('request');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.index = function (req, res) {
  async.parallel({
    book_count: function (callback) {
      Book.count({}, callback);
    },
    book_instance_count: function (callback) {
      BookInstance.count({}, callback);
    },
    book_instance_available_count: function (callback) {
      BookInstance.count({ status: 'Available' }, callback);
    },
    author_count: function (callback) {
      Author.count({}, callback);
    },
    genre_count: function (callback) {
      Genre.count({}, callback);
    },
  }, function (err, results) {
    console.log(results);
    res.render('index', { title: 'Local Library Home', error: err, data: results });
  });
}

// Display list of all books.
exports.book_list = function (req, res) {
  res.send('NOT IMPLEMENTED: Book list');
};

// Display detail page for a specific book.
exports.book_detail = function (req, res, next) {
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
    },
    book_instance: function (callback) {
      BookInstance.find({ 'book': req.params.id }).exec(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.book == null) {
      var err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    let data = {
      title: 'Title',
      book: results.book,
      book_instances: results.book_instance
    }
    // pug渲染的效果页
    res.render('../views/book/book_detail', data);
    // pug生成静态的html页面
    let htmlPath = path.join(__dirname, '..', '/static', '/book/', `${req.params.id}.html`);
    let html = pug.renderFile(path.join(__dirname, '..', '/views', '/book/', 'book_detail.pug'), data);
    fs.writeFile(htmlPath, html, 'utf-8', (error) => {
      if (error) throw error;
    })
  })
};

// Display book create form on GET.
exports.book_create_get = function (req, res) {
  res.render('../views/book/book_form', { title: 'Create Book' })
};

// Handle book create on POST.
exports.book_create_post = function (req, res, next) {
  let document = Array.prototype.slice.call(req.body.document);
  let data = {
    document: document
  }
  let url = 'https://ray666.cn/api/ceshi/mongoInsert';
  request({
    url: url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: JSON.stringify(data)
  }, (error, response, body) => {
    console.log(response);
    if (!error && response.statusCode == 200) {
      res.redirect(req.originalUrl)
    } else {
      // alert('数据错误');
    }
  });
};

// Display book delete form on GET.
exports.book_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Book update POST');
};