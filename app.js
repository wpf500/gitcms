var path = require('path');

var basicAuth = require('express-basic-auth');
var bodyParser = require('body-parser');
var express = require('express');
var expressNunjucks = require('express-nunjucks');
var sassMiddleware = require('node-sass-middleware');

var routes = require('./routes');
var db = require('./services/db');

var auth = require('./auth.json');

const app = express();
const isDev = app.get('env') === 'development';

app.set('views', path.join(__dirname, 'views'));
expressNunjucks(app, {
  'watch': isDev, 'noCache': isDev
});

app.use(basicAuth({'users': auth, 'challenge': true}));

app.use(bodyParser.urlencoded({'extended': true}));
app.use(bodyParser.json());

app.use(sassMiddleware({
  'src': __dirname,
  'dest': path.join(__dirname, 'build')
}));
app.use('/public', express.static(path.join(__dirname, 'build/public')));

app.use('/', routes);

db.open().then(() => app.listen(3000, () => {
  console.log('Listening on 3000');
}));
