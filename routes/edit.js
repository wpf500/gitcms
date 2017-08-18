import { openRepo, writeRepo } from '../services/repo';
import { listRepos } from '../services/db';

async function handleGet(req, res) {
    const repo = await openRepo(req.params.id);
    res.render('edit-repo', repo);
}

async function handlePost(req, res) {
    const oid = await writeRepo(req.params.id, req.params.page, req.body);
    res.send(oid);
}

export default function (app) {
    app.route('/edit/:id')
        .get(handleGet);

    app.route('/edit/:id/:page')
        .post(handlePost);

    app.route('/edit')
        .get((req, res) => {
            listRepos().then(repos => {
                res.render('edit', {repos});
            });
        });
}
