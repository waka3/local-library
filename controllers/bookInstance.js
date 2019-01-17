const BookInstance = require('../models/bookInstance');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const async = require('async');

exports.bookinstance_list = function (req, res) {
  BookInstance.find().populate('book').exec(function (err, list_bookinstances) {
    if (err) {
      return next(err)
    }
    var data = {
      title: 'Book Instance List',
      bookinstance_list: list_bookinstances
    }
    res.render('../views/book/bookinstance_list', data);
  })
};

exports.bookinstance_detail = function (req, res) {
  BookInstance.findById(req.params.id).populate('book').exec(function (err, bookinstance) {
    if (err) { return next(err); }
    if (bookinstance == null) { // No results.
      var err = new Error('Book copy not found');
      err.status = 404;
      return next(err);
    }
    // Successful, so render.
    res.render('../views/book/bookinstance_detail', { title: 'Book:', bookinstance: bookinstance });
  })
};

exports.bookinstance_create_get = function (req, res) {
  Book.find({}, 'title').exec(function (err, books) {
    if (err) {
      return next(err);
    }
    let data = {
      title: 'Create BookInstance',
      book_list: books
    }
    res.render('../views/book/bookInstance_form', data);
  })
};

exports.bookinstance_create_post = [
  // Validate fields.
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    var bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          // Successful, so render.
          res.render('../views/book/bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance });
        });
      return;
    }
    else {
      // Data from form is valid.
      bookinstance.save(function (err) {
        if (err) { return next(err); }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  }
]

exports.bookinstance_delete_get = function (req, res, next) {
  BookInstance.findById(req.params.id).exec(function (err, results) {
    if (err) {
      return next(err)
    }
    if (results === null) {
      var err = new Error('this is no bookinstance');
      err.status = '404';
      return next(err);
    }
    var data = {
      title: ''
    }
    res.render('../views/book/bookinstance_delete', data);
  })
};

exports.bookinstance_delete_post = function (req, res) {

};

exports.bookinstance_update_get = function (req, res) {
  async.parallel({
    book_list: function (callback) {
      Book.find().exec(callback);
    },
    bookinstance: function (callback) {
      BookInstance.findById(req.params.id).exec(callback)
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    var data = {
      title: 'Update BookInstance',
      book_list: results.book_list,
      bookinstance: results.bookinstance
    }
    res.render('../views/book/bookinstance_form', data)
  })
};

exports.bookinstance_update_post = [
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    var bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
        _id: req.params.id
      });

    if (!errors.isEmpty()) {
      Book.find({}, 'title').exec(function (err, books) {
        if (err) { return next(err); }
        var data = {
          title: 'Update BookInstance',
          book_list: books,
          errors: errors.array(),
          bookinstance: bookinstance
        }
        res.render('../views/book/bookinstance_form', data);
      });
      return;
    }
    else {
      BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err, thebookinstance) {
        if (err) { return next(err); }
        res.redirect(thebookinstance.url);
      });
    }
  }
]