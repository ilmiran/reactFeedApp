
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var comments = JSON.parse(fs.readFileSync('comments.json'))
console.log(comments);

app.use('/', express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/comments', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(comments));
});

var posts = JSON.parse(fs.readFileSync('posts.json'))
console.log(posts);

app.get('/posts', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(posts));
});

app.post('/comments', function(req, res) {
  comments.push(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(comments));
});

app.listen(3000);

console.log('Server started: http://localhost:3000/');