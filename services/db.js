import db from 'sqlite';

export function openDb() {
    return db.open('./database.sqlite', { Promise });
}
