var express = require('express');
var keygen = require('ssh-keygen2');
var { cloneRepo } = require('../services/repo');

const router = express.Router();

router.get('/', (req, res) => {
  keygen((err, keypair) => {
    res.render('add', keypair);
  });
});

router.post('/', (req, res) => {
  const {repoUrl, repoName, privateKey, publicKey} = req.body;
  cloneRepo(repoUrl, repoName, publicKey, privateKey).then(repo => {
    res.send('success!');
  }).catch(err => {
    console.log(err);
    res.send('error!');
  });
});

module.exports = router;
