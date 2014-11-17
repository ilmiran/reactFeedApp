
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var posts = JSON.parse(fs.readFileSync('posts.json'))
console.log(posts);

app.get('/posts', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(posts));
});

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/posts/:id', function(req, res) {
  var post = posts.filter(function(post){
    return req.params.id == post.id;
  });
  post[0].comments.push(req.body); 
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(post[0]));
});

app.delete('/posts/:id', function(req, res) {
  var newPosts = posts.filter(function(post){
    return req.params.id != post.id;
  }); 
  posts = newPosts;
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(posts));
});


app.listen(3000);

console.log('Server started: http://localhost:3000/');