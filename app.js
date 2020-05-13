const path = require('path');

const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const expressNunjucks = require('express-nunjucks');
const morgan = require('morgan');

const routes = require('./routes');
const db = require('./services/db');

const config = require('./config.json');

const app = express();
const isDev = app.get('env') === 'development';

app.set('views', path.join(__dirname, 'views'));
expressNunjucks(app, {
  'watch': isDev, 'noCache': isDev
});

app.use(morgan(':date[iso] :method :url :status :response-time ms - :res[content-length]'));
app.use(basicAuth({'users': config.auth, 'challenge': true}));
app.use(bodyParser.urlencoded({'extended': true}));
app.use(bodyParser.json());
app.use(compression());

app.use('/public', express.static(path.join(__dirname, 'build/public')));
app.use('/repos', express.static(path.join(__dirname, 'repos')));

app.use('/', routes);

const port = process.env.PORT || 3000;

db.open().then(() => app.listen(port, () => {
  console.log('Listening on ' + port);
}));
