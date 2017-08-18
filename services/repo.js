import path from 'path';
import fs from 'mz/fs';
import crypto from 'crypto';
import Git from 'nodegit';

import * as db from './db';

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

export async function openRepo(repoId) {
    const dbRepo = await db.fetchRepo(repoId);

    const repoDir = getRepoDir(dbRepo.url);
    const repo = await Git.Repository.open(repoDir);

    const fetchOpts = await getFetchOpts(dbRepo.publicKey, dbRepo.privateKey);
    await repo.fetchAll(fetchOpts)
    await repo.mergeBranches('master', 'origin/master');

    const def = JSON.parse(await fs.readFile(path.join(repoDir, '.gitcms.json')));

    const schema = def.schema;
    const uiSchema = def.uiSchema;
    const pages = await Promise.all(def.pages.map(loadPage.bind(null, repoDir)));

    return {repo, repoId, repoDir, dbRepo, pages, schema, uiSchema};
}

export async function writeRepo(repoId, pageId, data) {
    const {repo, repoDir, dbRepo, pages} = await openRepo(repoId);

    const page = pages.find(page => page.id === pageId);
    await fs.writeFile(path.join(repoDir, page.file), JSON.stringify(data, null, 2));

    var author = Git.Signature.now("GitCMS", "gitcms@test.com");
    const oid = await repo.createCommitOnHead([page.file], author, author,
        `Updated ${page.id}`);

    const remote = await repo.getRemote('origin');
    const fetchOpts = await getFetchOpts(dbRepo.publicKey, dbRepo.privateKey);
    await remote.push(['refs/heads/master:refs/heads/master'], fetchOpts);

    return oid;
}

export async function cloneRepo(repoUrl, repoName, publicKey, privateKey) {
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
