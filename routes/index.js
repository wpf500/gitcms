const express = require('express');

const router = express.Router();

router.use('/add', require('./add'));
router.use('/edit', require('./edit'));
router.use('/upload', require('./upload'));

router.get('/', (req, res) => {
  res.redirect('/edit');
});

module.exports = router;
