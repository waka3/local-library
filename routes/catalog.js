const express = require('express');
const router = express.Router();

const book = require('../controllers/book');
const author = require('../controllers/author');
const genre = require('../controllers/genre');
const bookInstance = require('../controllers/bookInstance');

router.get('/', book.index);
// book
router.get('/book/create', book.book_create_get);
router.post('/book/create', book.book_create_post);
router.get('/book/:id/delete', book.book_delete_get);
router.post('/book/:id/delete', book.book_delete_post);
router.get('/book/:id/update', book.book_update_get);
router.post('/book/:id/update', book.book_update_post);
router.get('/book/:id', book.book_detail);
router.get('/books', book.book_list);
// author
router.get('/author/create', author.author_create_get);
router.post('/author/create', author.author_create_post);
router.get('/author/:id/delete', author.author_delete_get);
router.post('/author/:id/delete', author.author_delete_post);
router.get('/author/:id/update', author.author_update_get);
router.post('/author/:id/update', author.author_update_post);
router.get('/author/:id', author.author_detail);
router.get('/authors', author.author_list);
// genre
router.get('/genre/create', genre.genre_create_get);
router.post('/genre/create', genre.genre_create_post);
router.get('/genre/:id/delete', genre.genre_delete_get);
router.post('/genre/:id/delete', genre.genre_delete_post);
router.get('/genre/:id/update', genre.genre_update_get);
router.post('/genre/:id/update', genre.genre_update_post);
router.get('/genre/:id', genre.genre_detail);
router.get('/genre', genre.genre_list);
// bookInstance
router.get('/bookInstance/create', bookInstance.bookinstance_create_get);
router.post('/bookInstance/create', bookInstance.bookinstance_create_post);
router.get('/bookInstance/:id/delete', bookInstance.bookinstance_delete_get);
router.post('/bookInstance/:id/delete', bookInstance.bookinstance_delete_post);
router.get('/bookInstance/:id/update', bookInstance.bookinstance_update_get);
router.post('/bookInstance/:id/update', bookInstance.bookinstance_update_post);
router.get('/bookInstance/:id', bookInstance.bookinstance_detail);
router.get('/bookInstances', bookInstance.bookinstance_list);

module.exports = router;