const path = require('path');

const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const expressNunjucks = require('express-nunjucks');
const morgan = require('morgan');

const routes = require('./routes');
const db = require('./services/db');

const auth = require('./auth.json');

const app = express();
const isDev = app.get('env') === 'development';

app.set('views', path.join(__dirname, 'views'));
expressNunjucks(app, {
  'watch': isDev, 'noCache': isDev
});

app.use(morgan('dev'));
app.use(basicAuth({'users': auth, 'challenge': true}));
app.use(bodyParser.urlencoded({'extended': true}));
app.use(bodyParser.json());
app.use(compression());

app.use('/public', express.static(path.join(__dirname, 'build/public')));

app.use('/', routes);

db.open().then(() => app.listen(3000, () => {
  console.log('Listening on 3000');
}));
