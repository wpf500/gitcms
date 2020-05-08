const fs = require('fs');
const path = require('path');

const express = require('express');
const asyncHandler = require('express-async-handler');

const { openRepo, writeRepo } = require('../services/repo');
const db = require('../services/db');

const router = express.Router();

router.get('/:id', (req, res) => {
  res.redirect(req.originalUrl + '/master');
});

const hasRepo = asyncHandler(async (req, res, next) => {
  const dbRepo = await db.fetchRepo(req.params.id, req.auth.user);
  if (dbRepo) {
    req.dbRepo = dbRepo;
    next();
  } else {
    next('route');
  }
});

router.get('/:id/:branch', hasRepo, asyncHandler(async (req, res) => {
  const {dbRepo, params: {branch}} = req;
  const repo = await openRepo(dbRepo, branch);
  res.render('edit/edit', {repo, dbRepo, branch});
}));

router.post('/:id/:branch/:page', hasRepo, asyncHandler(async (req, res) => {
  const {dbRepo, body, params: {branch, page}} = req;
  const oid = await writeRepo(dbRepo, branch, page, body);
  res.send(oid);
}));

router.get('/', asyncHandler(async (req, res) => {
  const dbRepos = await db.listRepos(req.auth.user);
  res.render('edit/list', {dbRepos});
}));

module.exports = router;
