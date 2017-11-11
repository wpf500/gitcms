var express = require('express');

var add = require('./add');
var edit = require('./edit');

const router = express.Router();

router.use('/add', add);
router.use('/edit', edit);

router.get('/', (req, res) => {
  res.redirect('/edit');
});

module.exports = router;
