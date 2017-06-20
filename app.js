import express from 'express';
import sassMiddleware from 'node-sass-middleware';
import expressNunjucks from 'express-nunjucks';
import path from 'path';

const app = express();
const isDev = app.get('env') === 'development';

app.set('views', path.join(__dirname, 'views'));

app.use(sassMiddleware({
    'src': __dirname,
    'dest': path.join(__dirname, 'build')
}));

app.use('/public', express.static(path.join(__dirname, 'build/public')));

expressNunjucks(app, {
    'watch': isDev, 'noCache': isDev
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000, () => {
    console.log('Listening on 3000');
});
