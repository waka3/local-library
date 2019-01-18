const express = require('express');
const router = express.Router();
const clear_cache = require('../controllers/clear_cache');

router.get('/bookCache/', clear_cache.BookDetailCache);

module.exports = router;