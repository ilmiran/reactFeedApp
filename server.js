var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

var posts = JSON.parse(fs.readFileSync('posts.json'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header( 'Access-Control-Allow-Methods', "GET, POST, OPTIONS, DELETE");
  next();
});

app.get('/posts.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(posts));
});

app.post('/posts.json', function(req, res) {
  var newPost = req.body;
  newPost.comments = [];
  newPost.id = Math.floor((Math.random() * 20) + 6);;
  posts.push(newPost);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(posts));
});

app.post('/posts.json/:id', function(req, res) {
  var post = posts.filter(function(post){
    return req.params.id == post.id;
  });
  post[0].comments.push(req.body); 
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(post[0]));
});

app.delete('/posts.json/:id', function(req, res) {
  var newPosts = posts.filter(function(post){
    return req.params.id != post.id;
  }); 
  posts = newPosts;
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(posts));
});

app.listen(3001);

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost:3000');
});