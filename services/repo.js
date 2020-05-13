const path = require('path');
const fs = require('mz/fs');
const crypto = require('crypto');
const Git = require('nodegit');
const yaml = require('js-yaml');

function getRepoId(repoUrl) {
   return crypto.createHash('sha1').update(repoUrl).digest('hex');
}

function getRepoPaths(repoId) {
  const repoDir = path.join(__dirname, '../repos', repoId);
  return {
    repoDir,
    publicKeyFile: repoDir + '.id_rsa.pub',
    privateKeyFile: repoDir + '.id_rsa',
    defFile: repoDir + '/.gitcms'
  };
}

function getFetchOpts(repoId) {
  const {publicKeyFile, privateKeyFile} = getRepoPaths(repoId);

  return {
    'callbacks': {
      'credentials': function (url, userName) {
        return Git.Cred.sshKeyNew(userName, publicKeyFile, privateKeyFile, '')
      },
      'certificateCheck': () => 0
    }
  };
}

async function loadPage(repoDir, page) {
  try {
    const data = await fs.readFile(path.join(repoDir, page.file), 'utf8');
    return {...page, 'data': JSON.parse(data)};
  } catch (e) {
    return page;
  }
}

async function openRepo(dbRepo, branch) {
  const {repoDir, defFile} = getRepoPaths(dbRepo.id);
  const repo = await Git.Repository.open(repoDir);

  const fetchOpts = getFetchOpts(dbRepo.id);
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

  const def = await fs.exists(defFile + '.yml') ?
    yaml.safeLoad(await fs.readFile(defFile + '.yml', 'utf8')) :
    JSON.parse(await fs.readFile(defFile + '.json', 'utf8'));

  // Upgrade version 1 def files
  if (!def.version || def.version === 1) {
    const {schema, uiSchema} = def;
    def.pages.forEach(page => {
      page.schema = schema;
      page.uiSchema = uiSchema;
    });
  }

  const pages = await Promise.all(def.pages.map(page => loadPage(repoDir, page)));

  return {repo, repoDir, pages};
}

async function writeRepo(dbRepo, branch, pageId, data) {
  const {repo, repoDir, pages} = await openRepo(dbRepo, branch);

  const page = pages.find(page => page.id === pageId);
  await fs.writeFile(path.join(repoDir, page.file), JSON.stringify(data, null, 2));

  const author = Git.Signature.now("GitCMS", "gitcms@test.com");
  const oid = await repo.createCommitOnHead([page.file], author, author,
    `Updated ${page.id}`);

  const remote = await repo.getRemote('origin');
  const fetchOpts = getFetchOpts(dbRepo.id);
  await remote.push([`refs/heads/${branch}:refs/heads/${branch}`], fetchOpts);

  return oid;
}

async function cloneRepo(repoUrl, publicKey, privateKey) {
  const repoId = getRepoId(repoUrl);
  const {repoDir, publicKeyFile,privateKeyFile} = getRepoPaths(repoId);

  if (await fs.exists(repoDir)) {
    throw new Error("Already exists!");
  } else {
    await fs.writeFile(publicKeyFile, publicKey);
    await fs.writeFile(privateKeyFile, privateKey);
    const fetchOpts = getFetchOpts(repoId);
    await Git.Clone(repoUrl, repoDir, {fetchOpts});
    return repoId;
  }
}

module.exports = {
  getRepoPaths,
  openRepo,
  writeRepo,
  cloneRepo
};
