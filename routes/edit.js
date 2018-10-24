const express = require('express');
const asyncHandler = require('express-async-handler');

const { openRepo, writeRepo } = require('../services/repo');
const db = require('../services/db');

const router = express.Router();

router.get('/:id', (req, res) => {
  res.redirect(req.originalUrl + '/master');
});

router.get('/:id/:branch', asyncHandler(async (req, res) => {
  const {params: {id, branch}, auth: {user}} = req;

  const dbRepo = await db.fetchRepo(id, user);
  const repo = await openRepo(dbRepo, branch);

  res.render('edit/edit', {...repo, dbRepo});
}));

router.post('/:id/:branch/:page/', asyncHandler(async (req, res) => {
  const {body, params: {id, branch, page}, auth: {user}} = req;

  const dbRepo = await db.fetchRepo(id, user);
  const oid = await writeRepo(dbRepo, branch, page, body);

  res.send(oid);
}));

router.get('/', asyncHandler(async (req, res) => {
  const dbRepos = await db.listRepos(req.auth.user);
  res.render('edit/list', {dbRepos});
}));

module.exports = router;
