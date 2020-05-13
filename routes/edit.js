const express = require('express');
const asyncHandler = require('express-async-handler');
const fs = require('mz/fs');

const { getRepoPaths, openRepo, writeRepo, deleteRepo } = require('../services/repo');
const db = require('../services/db');

const router = express.Router();

router.get('/:id', (req, res) => {
  res.redirect(`${req.baseUrl}/${req.params.id}/branch/master`);
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

router.get('/:id/branch/:branch', hasRepo, asyncHandler(async (req, res) => {
  const {dbRepo, params: {branch}} = req;
  const repo = await openRepo(dbRepo, branch);
  res.render('edit/branch', {repo, dbRepo, branch});
}));

router.post('/:id/branch/:branch/:page', hasRepo, asyncHandler(async (req, res) => {
  const {dbRepo, body, params: {branch, page}} = req;
  const oid = await writeRepo(dbRepo, branch, page, body);
  res.send(oid);
}));

router.get('/:id/settings', hasRepo, asyncHandler(async (req, res) => {
  const publicKey = await fs.readFile(getRepoPaths(req.params.id).publicKeyFile);
  res.render('edit/settings', {dbRepo: req.dbRepo, publicKey});
}));

router.post('/:id/settings', hasRepo, asyncHandler(async (req, res) => {
  const {repoLiveUrl, repoName, repoUsers, action} = req.body;
  if (action === 'save') {
    await db.updateRepo(req.params.id, repoName, repoLiveUrl, repoUsers);
    res.redirect(`${req.baseUrl}/${req.params.id}/settings`);
  } else if (action === 'delete') {
    await db.deleteRepo(req.params.id);
    await deleteRepo(req.dbRepo);
    res.redirect('/');
  }
}));

// Redirect old URLs
router.get('/:id/:branch', hasRepo, (req, res) => {
  res.redirect(`${req.baseUrl}/${req.params.id}/branch/${req.params.branch}`);
});

router.get('/', asyncHandler(async (req, res) => {
  const dbRepos = await db.listRepos(req.auth.user);
  res.render('edit/list', {dbRepos});
}));

module.exports = router;
