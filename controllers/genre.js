const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Genre.
exports.genre_list = function (req, res, next) {
  Genre.find().exec(function (err, genre_list) {
    if (err) {
      return next(err);
    }
    var data = {
      title: 'Genre List',
      genre_list: genre_list
    }
    res.render('../views/genre/genre_list', data);
  })
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id).exec(callback)
    },
    genre_books: function (callback) {
      Book.find({ 'genre': req.params.id }).exec(callback)
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.genre === null) {
      var err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    let data = {
      title: 'Genre Details',
      genre: results.genre,
      genre_books: results.genre_books
    }
    res.render('../views/genre/genre_detail', data);
  })
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
  let data = {
    title: 'Create Genre',
  }
  res.render('../views/genre/genre_form', data);
};

// Handle Genre create on POST.
exports.genre_create_post = [
  body('name', 'Genre name required').isLength({ min: 1 }).trim(),
  sanitizeBody('name').trim().escape(),
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a genre object with escaped and trimmed data.
    // 创建一个Genre数据
    var genre = new Genre(
      { name: req.body.name }
    );
    if (!errors.isEmpty()) {
      res.render('./views/genre/genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() })
      return;
    } else {
      Genre.findOne({ 'name': req.body.name }).exec(function (err, found_genre) {
        if (err) {
          return next(err);
        }
        if (found_genre) {
          res.redirect(found_genre.url);
        } else {
          genre.save(function (err) {
            if (err) {
              return next(err);
            }
            res.redirect(genre.url);
          })
        }
      })
    }
  }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.params.id).exec(callback);
    },
    genre_books: function (callback) {
      Book.find({ 'genre': req.params.id }).exec(callback);
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    var data = {
      title: 'Delete Genre',
      genre: results.genre,
      genre_books: results.genre_books
    }
    res.render('../views/genre/genre_delete', data)
  })
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
  async.parallel({
    genre: function (callback) {
      Genre.findById(req.body.genreId).exec(callback)
    },
    genre_books: function (callback) {
      Book.find({ 'Genre': req.body.genreId }).exec(callback)
    }
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    if (results.genre_books.length > 0) {
      var data = {
        title: 'Delete Genre',
        genre: results.genre,
        genre_books: results.genre_books
      }
      res.render('../views/genre/genre_delete', data)
      return;
    } else {
      Genre.findByIdAndRemove(req.body.genreId, function deleteBook(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/catalog/genres')
      })
    }
  })
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {
  Genre.findById(req.params.id).exec(function (err, results) {
    if (err) {
      return next(err);
    }
    if (results == null) {
      var err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    let data = {
      title: 'Update Genre',
      genre: results
    }
    res.render('../views/genre/genre_form', data);
  })
};

// Handle Genre update on POST.
exports.genre_update_post = [
  body('name', 'Genre name required').isLength({ min: 1 }).trim(),
  sanitizeBody('name').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    var genre = new Genre(
      {
        name: req.body.name,
        _id: req.params.id
      }
    );
    if (!errors.isEmpty()) {
      var data = {
        title: 'Update Genre',
        genre: genre,
        errors: errors.array()
      }
      res.render('../views/genre/genre_form', data)
      return;
    } else {
      Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, theGenre) {
        if (err) {
          return next(err);
        } else {
          res.redirect(theGenre.url);
        }
      })
    }
  }
];