const Genre = require('../models/genre');
const book = require('../models/book');
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
            book.find({ 'genre': req.params.id }).exec(callback)
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
    res.render('../views/genre/genre_form', { title: 'Create Genre' })
};

// Handle Genre create on POST.
exports.genre_create_post = [
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    sanitizeBody('name').trim().escape(),
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        // Create a genre object with escaped and trimmed data.
        var genre = new Genre(
            { name: req.body.name }
        );
        if (!errors.isEmpty()){
            res.render('genre_form', {title: 'Create Genre'})
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};