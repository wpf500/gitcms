const express = require('express');
const asyncHandler = require('express-async-handler');
const keygen = require('ssh-keygen2');

const db = require('../services/db');
const { cloneRepo } = require('../services/repo');

const router = express.Router();

router.use((req, res, next) => {
  if (req.auth.user === 'admin') {
    next();
  } else {
    res.status(401).send();
  }
});

router.get('/', (req, res) => {
  keygen((err, keypair) => {
    res.render('edit/settings', {
      publicKey: keypair.public,
      privateKey: keypair.private
    });
  });
});

router.post('/', asyncHandler(async (req, res) => {
  const {repoUrl, repoLiveUrl, repoName, repoUsers, privateKey, publicKey} = req.body;

  const repoId = await cloneRepo(repoUrl, publicKey, privateKey);
  await db.addRepo(repoId, repoName, repoUrl, repoLiveUrl, repoUsers);

  res.redirect('/edit/' + repoId);
}));

module.exports = router;
