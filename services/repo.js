var path = require('path');
var fs = require('mz/fs');
var crypto = require('crypto');
var Git = require('nodegit');

var db = require('./db');

function getRepoId(repoUrl) {
   return crypto.createHash('sha1').update(repoUrl).digest('hex');
}

function getRepoDir(repoUrl) {
  return path.join(__dirname, '../repos', getRepoId(repoUrl));
}

async function getFetchOpts(publicKey, privateKey) {
  const creds = await Git.Cred.sshKeyMemoryNew('git', publicKey, privateKey, '');

  return {
    'callbacks': {
      'credentials': () => creds,
      'certificateCheck': () => 1
    }
  };
}

async function loadPage(repoDir, page) {
  try {
    const data = await fs.readFile(path.join(repoDir, page.file));
    return Object.assign({}, page, {'data': JSON.parse(data)});
  } catch (e) {
    return page;
  }
}

async function openRepo(repoId, branch) {
  const dbRepo = await db.fetchRepo(repoId);

  const repoDir = getRepoDir(dbRepo.url);
  const repo = await Git.Repository.open(repoDir);

  await repo.checkoutBranch(branch);

  const fetchOpts = await getFetchOpts(dbRepo.publicKey, dbRepo.privateKey);
  await repo.fetchAll(fetchOpts)
  await repo.mergeBranches(branch, 'origin/' + branch);

  const def = JSON.parse(await fs.readFile(path.join(repoDir, '.gitcms.json')));

  const schema = def.schema;
  const uiSchema = def.uiSchema;
  const pages = await Promise.all(def.pages.map(loadPage.bind(null, repoDir)));

  return {repo, repoDir, dbRepo, pages, schema, uiSchema};
}

async function writeRepo(repoId, branch, pageId, data) {
  const {repo, repoDir, dbRepo, pages} = await openRepo(repoId, branch);

  await repo.checkoutBranch(branch);

  const page = pages.find(page => page.id === pageId);
  await fs.writeFile(path.join(repoDir, page.file), JSON.stringify(data, null, 2));

  var author = Git.Signature.now("GitCMS", "gitcms@test.com");
  const oid = await repo.createCommitOnHead([page.file], author, author,
    `Updated ${page.id}`);

  const remote = await repo.getRemote('origin');
  const fetchOpts = await getFetchOpts(dbRepo.publicKey, dbRepo.privateKey);
  await remote.push([`refs/heads/${branch}:refs/heads/${branch}`], fetchOpts);

  return oid;
}

async function cloneRepo(repoUrl, repoName, publicKey, privateKey) {
  const repoId = getRepoId(repoUrl);
  const repoDir = getRepoDir(repoUrl);

  const exists = await fs.exists(repoDir);
  if (exists) {
    throw new Exception("Already exists!");
  } else {
    const fetchOpts = await getFetchOpts(publicKey, privateKey);
    const repo = await Git.Clone(repoUrl, repoDir, {fetchOpts});
    db.addRepo(repoId, repoName, repoUrl, publicKey, privateKey);

    return repo;
  }
}

module.exports = {
  openRepo,
  writeRepo,
  cloneRepo
};
