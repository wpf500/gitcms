const path = require('path');
const fs = require('mz/fs');
const crypto = require('crypto');
const Git = require('nodegit');

function getRepoId(repoUrl) {
   return crypto.createHash('sha1').update(repoUrl).digest('hex');
}

function getRepoDir(repoId) {
  return path.join(__dirname, '../repos', repoId);
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

async function openRepo(dbRepo, branch) {
  const repoDir = getRepoDir(dbRepo.id);
  const repo = await Git.Repository.open(repoDir);

  const fetchOpts = await getFetchOpts(dbRepo.publicKey, dbRepo.privateKey);
  await repo.fetchAll(fetchOpts);

  try {
    await repo.checkoutBranch(branch);
    await repo.mergeBranches(branch, 'origin/' + branch);
  } catch (err) {
    console.error('Fetching new branch');
    const ref = await repo.createBranch(branch, await repo.getHeadCommit(), false);
    await repo.checkoutBranch(ref);
    const commit = await repo.getReferenceCommit('refs/remotes/origin/' + branch);
    await Git.Reset.reset(repo, commit, Git.Reset.TYPE.HARD, {});
  }

  const def = JSON.parse(await fs.readFile(path.join(repoDir, '.gitcms.json')));

  const schema = def.schema;
  const uiSchema = def.uiSchema;
  const pages = await Promise.all(def.pages.map(loadPage.bind(null, repoDir)));

  return {repo, repoDir, pages, schema, uiSchema};
}

async function writeRepo(dbRepo, branch, pageId, data) {
  const {repo, repoDir, pages} = await openRepo(dbRepo, branch);

  const page = pages.find(page => page.id === pageId);
  await fs.writeFile(path.join(repoDir, page.file), JSON.stringify(data, null, 2));

  const author = Git.Signature.now("GitCMS", "gitcms@test.com");
  const oid = await repo.createCommitOnHead([page.file], author, author,
    `Updated ${page.id}`);

  const remote = await repo.getRemote('origin');
  const fetchOpts = await getFetchOpts(dbRepo.publicKey, dbRepo.privateKey);
  await remote.push([`refs/heads/${branch}:refs/heads/${branch}`], fetchOpts);

  return oid;
}

async function cloneRepo(repoUrl, publicKey, privateKey) {
  const repoId = getRepoId(repoUrl);
  const repoDir = getRepoDir(repoId);

  const exists = await fs.exists(repoDir);
  if (exists) {
    throw new Exception("Already exists!");
  } else {
    const fetchOpts = await getFetchOpts(publicKey, privateKey);
    await Git.Clone(repoUrl, repoDir, {fetchOpts});
    return repoId;
  }
}

module.exports = {
  openRepo,
  writeRepo,
  cloneRepo
};
