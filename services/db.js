var fs = require('mz/fs');
var db = require('sqlite');

async function open() {
  const dbExists = await fs.exists('./database.sqlite');
  await db.open('./database.sqlite', { Promise });

  if (!dbExists) {
    console.log('Initialising database');
    const initSQL = await fs.readFile('./init.sql');
    await db.run(initSQL.toString());
  }
}

async function addRepo(id, name, url, publicKey, privateKey) {
  await db.run(`INSERT INTO repositories (id, name, url, publicKey, privateKey)
                VALUES (?, ?, ?, ?, ?)`, id, name, url, publicKey, privateKey);
}

async function fetchRepo(id) {
  return await db.get('SELECT * FROM repositories WHERE id=?', id);
}

async function listRepos() {
  return await db.all('SELECT * FROM repositories');
}

module.exports = {
  open,
  addRepo,
  fetchRepo,
  listRepos
};
