import fs from 'mz/fs';
import db from 'sqlite';

export async function open() {
    const dbExists = await fs.exists('./database.sqlite');
    await db.open('./database.sqlite', { Promise });

    if (!dbExists) {
        console.log('Initialising database');
        const initSQL = await fs.readFile('./init.sql');
        await db.run(initSQL.toString());
    }
}

export async function addRepo(id, url, publicKey, privateKey) {
    await db.run(`INSERT INTO repositories (id, url, publicKey, privateKey)
                    VALUES (?, ?, ?, ?)`, id, url, publicKey, privateKey);
}

export async function fetchRepo(id) {
    return await db.get('SELECT * FROM repositories WHERE id=?', id);
}

export async function listRepos() {
    return await db.all('SELECT * FROM repositories');
}
