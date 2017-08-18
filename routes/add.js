import keygen from 'ssh-keygen2';
import { cloneRepo } from '../services/repo';

export default function (app) {
    app.route('/add')
        .get((req, res) => {
            keygen((err, keypair) => {
                res.render('add', keypair);
            });
        })
        .post((req, res) => {
            const {repoUrl, repoName, privateKey, publicKey} = req.body;
            cloneRepo(repoUrl, repoName, publicKey, privateKey).then(repo => {
                res.send('success!');
            }).catch(err => {
                console.log(err);
                res.send('error!');
            });
        });
}
