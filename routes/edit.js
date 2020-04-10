const fs = require('fs');

const busboy = require('connect-busboy');
const express = require('express');
const asyncHandler = require('express-async-handler');

const { openRepo, writeRepo, getRepoDir } = require('../services/repo');
const db = require('../services/db');

const router = express.Router();

router.get('/:id', (req, res) => {
  res.redirect(req.originalUrl + '/master');
});

router.get('/:id/:branch', asyncHandler(async (req, res) => {
  const {params: {id, branch}, auth: {user}} = req;

  const dbRepo = await db.fetchRepo(id, user);
  const repo = await openRepo(dbRepo, branch);

  res.render('edit/edit', {repo, dbRepo, branch});
}));

router.post('/:id/:branch/:page', asyncHandler(async (req, res) => {
  const {body, params: {id, branch, page}, auth: {user}} = req;

  const dbRepo = await db.fetchRepo(id, user);
  if (dbRepo) {
    const oid = await writeRepo(dbRepo, branch, page, body);
    res.send(oid);
  } else {
    res.status(401).send('');
  }
}));

router.post('/:id/:branch/:page/files', busboy(), (req, res) => {
  let url;

  req.busboy.on('field', (fieldname, value) => {
    if (fieldname === 'url') {
      url = value;
      console.log('Got URL', url);
    }
  });

  req.busboy.on('file', (fieldname, file) => {
    console.log('Got file', file);
    file.pipe(fs.createWriteStream(url));
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
