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
    res.render('index', { title: 'Local Library Home', error: err, data: results });
  });
}

// 查 书列表
exports.book_list = function (req, res) {
  Book.find({}, 'title author').populate('author').exec(function (err, results) {
    if (err) {
      return next(err);
    }
    let data = {
      title: 'Book list',
      book_list: results
    }
    res.render('../views/book/book_list.pug', data);
  })
};

// 查 书详情
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

// 查
exports.book_create_get = function (req, res) {
  async.parallel({
    authors: function (callback) {
      Author.find(callback);
    },
    genres: function (callback) {
      Genre.find(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    let data = {
      title: 'Create Book',
      authors: results.authors,
      genres: results.genres
    }
    res.render('../views/book/book_form', data);
  })
};

// 增 书
exports.book_create_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined')
        req.body.genre = [];
      else
        req.body.genre = new Array(req.body.genre);
    }
    next();
  },
  body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
  body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
  body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
  body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),
  sanitizeBody('*').trim().escape(),
  (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre
    })
    if (!errors.isEmpty()) {
      async.parallel({
        authors: function (callback) {
          Author.find(callback);
        },
        genres: function (callback) {
          Genre.find(callback);
        },
      }, function (err, results) {
        if (err) { return next(err); }

        // Mark our selected genres as checked.
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        let data = {
          title: 'Create Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors.array()
        }
        console.log(data);
        res.render('../views/book/book_form', data);
      });
      return;
    } else {
      // Data from form is valid. Save book.
      book.save(function (err) {
        if (err) { return next(err); }
        //successful - redirect to new book record.
        res.redirect(book.url);
      });
    }
  }

]

// 查 书
exports.book_delete_get = function (req, res) {
  
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