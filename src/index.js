import fs from 'mz/fs';
import path from 'path';
import Git from 'nodegit';
import crypto from 'crypto';

function getRepoDir(repoUrl) {
    const hash = crypto.createHash('sha1').update(repoUrl).digest('hex');
    return path.join(__dirname, '../repo', hash);
}

async function loadRepo(repoUrl) {
    const repoDir = getRepoDir(repoUrl);

    const exists = await fs.exists(repoDir);
    const repo = await (exists ? Git.Repository.open(repoDir) : Git.Clone(repoUrl, repoDir));

    await repo.fetchAll()
    await repo.mergeBranches('master', 'origin/master');

    return repo;
}

loadRepo('https://github.com/normalize/mz').then(repo => {
    console.log(repo);
});
