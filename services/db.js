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

async function addRepo(id, name, url, liveUrl, users) {
  await db.run(
    `INSERT INTO repositories (id, name, url, liveUrl, users) VALUES (?, ?, ?, ?, ?)`,
    id, name, url, liveUrl, users
  );
}

async function deleteRepo(id) {
  await db.run(`DELETE FROM repositories WHERE id=?`, id);
}

async function fetchRepo(id, user) {
  return await db.get(
    'SELECT * FROM repositories WHERE id=? AND users LIKE ?',
    id, `%,${user},%`
  );
}

async function listRepos(user) {
  return await db.all(
    'SELECT * FROM repositories WHERE users LIKE ?',
    `%,${user},%`
  );
}

async function updateRepo(id, name, liveUrl, users) {
  await db.run(
    `UPDATE repositories SET name=?, liveUrl=?, users=? WHERE id=?`,
    name, liveUrl, users, id
  );
}

module.exports = {
  open,
  addRepo,
  deleteRepo,
  fetchRepo,
  listRepos,
  updateRepo
};
