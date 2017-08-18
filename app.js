import path from 'path';

import bodyParser from 'body-parser';
import express from 'express';
import expressNunjucks from 'express-nunjucks';
import sassMiddleware from 'node-sass-middleware';

import addRoutes from './routes/add';
import editRoutes from './routes/edit';

import * as db from './services/db';

const app = express();
const isDev = app.get('env') === 'development';

app.set('views', path.join(__dirname, 'views'));
expressNunjucks(app, {
    'watch': isDev, 'noCache': isDev
});

app.use(bodyParser.urlencoded({'extended': true}));
app.use(bodyParser.json());

app.use(sassMiddleware({
    'src': __dirname,
    'dest': path.join(__dirname, 'build')
}));
app.use('/public', express.static(path.join(__dirname, 'build/public')));

addRoutes(app);
editRoutes(app);

app.get('/', (req, res) => {
    res.render('index');
});

db.open().then(() => app.listen(3000, () => {
    console.log('Listening on 3000');
}));
