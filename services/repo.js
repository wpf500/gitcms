import path from 'path';
import fs from 'mz/fs';
import crypto from 'crypto';
import Git from 'nodegit';

function getRepoDir(repoUrl) {
    const hash = crypto.createHash('sha1').update(repoUrl).digest('hex');
    return path.join(__dirname, '../repos', hash);
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

export async function loadRepo(repoUrl, publicKey, privateKey) {
    // TODO: get keys from sqlite
    const repo = await Git.Repository.open(repoDir);

    const fetchOpts = await getFetchOpts(publicKey, privateKey);
    await repo.fetchAll(fetchOpts)
    await repo.mergeBranches('master', 'origin/master');

    return repo;
}

export async function cloneRepo(repoUrl, publicKey, privateKey) {
    const repoDir = getRepoDir(repoUrl);
    const exists = await fs.exists(repoDir);

    if (exists) {
        return await loadRepo(repoUrl, publicKey, privateKey);
    } else {
        const fetchOpts = await getFetchOpts(publicKey, privateKey);
        // TODO: save keys
        return await Git.Clone(repoUrl, repoDir, {fetchOpts});
    }
}
