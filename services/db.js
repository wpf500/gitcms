const fs = require('mz/fs');
const db = require('sqlite');

async function open() {
  const dbExists = await fs.exists('./database.sqlite');
  await db.open('./database.sqlite', { Promise });

  if (!dbExists) {
    console.log('Initialising database');
    const initSQL = await fs.readFile('./init.sql');
    await db.run(initSQL.toString());
  }
}

async function addRepo(id, name, url, users, publicKey, privateKey) {
  await db.run(`INSERT INTO repositories (id, name, url, users, publicKey, privateKey)
                VALUES (?, ?, ?, ?, ?, ?)`, id, name, url, users, publicKey, privateKey);
}

async function fetchRepo(id, user) {
  return await db.get('SELECT * FROM repositories WHERE id=? AND users LIKE ?', id, '%,' + user + ',%');
}

async function listRepos(user) {
  return await db.all('SELECT * FROM repositories WHERE users LIKE ?', '%,' + user + ',%');
}

module.exports = {
  open,
  addRepo,
  fetchRepo,
  listRepos
};
