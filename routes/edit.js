const fs = require('fs');
const path = require('path');

const busboy = require('connect-busboy');
const express = require('express');
const asyncHandler = require('express-async-handler');
const mime = require('mime-types');

const { openRepo, writeRepo, getRepoDir } = require('../services/repo');
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

router.get('/:id/:branch/:page/files', hasRepo, (req, res) => {
  const {filepath} = req.query;
  const repoDir = getRepoDir(req.dbRepo.id);
  console.log(path.join(repoDir, filepath));
  res.setHeader('content-type', mime.lookup(filepath));
  fs.createReadStream(path.join(repoDir, filepath)).pipe(res);
});

router.post('/:id/:branch/:page/files', hasRepo, busboy(), (req, res) => {
  let filepath;

  req.busboy.on('field', (fieldname, value) => {
    if (fieldname === 'filepath') {
      filepath = value;
    }
  });

  req.busboy.on('file', (fieldname, file) => {
    const repoDir = getRepoDir(req.dbRepo.id);
    file.pipe(fs.createWriteStream(path.join(repoDir, filepath)));
  });

  req.busboy.on('finish', () => {
    res.send('');
  });

  req.pipe(req.busboy);
});

router.get('/', asyncHandler(async (req, res) => {
  const dbRepos = await db.listRepos(req.auth.user);
  res.render('edit/list', {dbRepos});
}));

module.exports = router;
