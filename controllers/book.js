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
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id).exec(callback)
    },
    book_instances: function (callback) {
      BookInstance.find({ 'book': req.params.id }).exec(callback)
    }
  }, function (err, results) {
    if (err) {
      return next(err)
    }
    let data = {
      title: 'Delete Book',
      book: results.book,
      book_instances: results.book_instances
    }
    res.render('../views/book/book_delete.pug', data);
  })
};

// 删除
exports.book_delete_post = function (req, res, next) {
  async.parallel({
    book: function (callback) {
      Book.findById(req.body.bookId).exec(callback)
    },
    book_instances: function (callback) {
      BookInstance.find({ 'book': req.body.bookId }).exec(callback)
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.book_instances.length > 0) {
      let data = {
        title: 'Delete Book',
        book: results.book,
        book_instances: results.book_instances
      }
      res.render('../views/book/book_delete.pug', data);
      return;
    } else {
      Book.findByIdAndRemove(req.body.bookId, function deleteBook(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/catalog/books')
      })
    }
  })
};

// 查
exports.book_update_get = function (req, res) {
  async.parallel({
    book: function (callback) {
      Book.findById(req.params.id).populate('author').populate('genre').exec(callback)
    },
    authors: function (callback) {
      Author.find(callback)
    },
    genres: function (callback) {
      Genre.find(callback)
    }
  }, function (err, results) {
    console.log(results.book)
    if (err) {
      return next(err)
    }
    if (results.book == null) {
      var err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    // 标记当前书本的类别
    for (var i = 0; i < results.genres.length; i++) {
      for (var j = 0; j < results.book.genre.length; j++) {
        if (results.genres[i]._id.toString() == results.book.genre[j]._id.toString()) {
          results.genres[i].checked = 'true';
        }
      }
    }
    let data = {
      title: 'Update Book',
      book: results.book,
      authors: results.authors,
      genres: results.genres
      }
      console.log(data.book.author.id);
      console.log(data.authors[0]);
    res.render('../views/book/book_form.pug', data);
  })
};

// 修改 
exports.book_update_post = [
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
    const errors = validationResult(req);
    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
      _id: req.params.id
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
        // 标记当前书本的作者
        for (let i = 0; i < results.authors.length; i++) {
          if (book.author.indexOf(results.authors[i]._id) > -1) {
            results.authors[i].selected = true;
          }
        }
        // 标记当前书本的类别
        for (let i = 0; i < results.genres.length; i++) {
          if (book.genre.indexOf(results.genres[i]._id) > -1) {
            results.genres[i].checked = 'true';
          }
        }
        let data = {
          title: 'Update Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors.array()
        }
        res.render('../views/book/book_form', data);
      });
      return;
    } else {
      Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook) {
        if (err) { return next(err); }
        res.redirect(thebook.url);
      });
    }
  }
]