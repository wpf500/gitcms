var express = require('express');

var { openRepo, writeRepo } = require('../services/repo');
var { listRepos } = require('../services/db');

const router = express.Router();

router.get('/:id', async (req, res) => {
  const repo = await openRepo(req.params.id);
  res.render('edit-repo', repo);
});

router.post('/:id/:page', async (req, res) => {
  const oid = await writeRepo(req.params.id, req.params.page, req.body);
  res.send(oid);
});

router.get('/', async (req, res) => {
  const repos = await listRepos();
  res.render('edit', {repos});
});

module.exports = router;
