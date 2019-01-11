const Author = require('../models/author');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

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
  res.render('../views/author/author_form.pug', { title: 'Create Author' })
}

exports.author_create_post = [
  body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First_name has non-alphanumeric characters'),
  body('family_name').isLength({ min: 1 }).trim().withMessage('Family name munst be specified.')
    .isAlphanumeric().withMessage('Family name has non-alphanumeric characters '),
  body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
  body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

  sanitizeBody('first_name').trim().escape(),
  sanitizeBody('family_name').trim().escape(),
  sanitizeBody('date_of_birth').toDate(),
  sanitizeBody('date_of_death').toDate(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let data = {
        title: 'Create Author',
        author: req.body,
        errors: errors.array()
      }
      res.render('../views/author/author_form', data);
    } else {
      var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      })
      author.save(function (err) {
        if (err) {
          return next(err)
        }
        res.redirect(author.url);
      })
    }
  }
]

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
