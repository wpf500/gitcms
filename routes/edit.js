const express = require('express');
const asyncHandler = require('express-async-handler');

const { openRepo, writeRepo } = require('../services/repo');
const { listRepos } = require('../services/db');

const router = express.Router();

router.get('/:id', (req, res) => {
  res.redirect(req.originalUrl + '/master');
});

router.get('/:id/:branch', asyncHandler(async (req, res) => {
  const {id, branch} = req.params;
  const repo = await openRepo(id, branch);
  res.render('edit/edit', repo);
}));

router.post('/:id/:branch/:page/', asyncHandler(async (req, res) => {
  const {body, params: {id, branch, page}} = req;
  const oid = await writeRepo(id, branch, page, body);
  res.send(oid);
}));

router.get('/', asyncHandler(async (req, res) => {
  const repos = await listRepos();
  res.render('edit/list', {repos});
}));

module.exports = router;
