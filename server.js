(function() {
  var app, auth, controller, dburl, express, fs, mongoose, multer, port, server, upload;

  express = require('express');

  global.app = app = express();

  server = require('http').createServer(app);

  multer = require('multer');

  upload = multer({
    dest: 'uploads/'
  });

  fs = require('fs');

  app.configure(function() {
    app.use(express["static"](__dirname + '/app'));
    return app.use(express.json()).use(express.urlencoded());
  });

  auth = require('basic-auth');

  mongoose = require('mongoose');

  dburl = process.env.MONGOLAB_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/mydb";

  console.log(dburl);

  mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  port = "4000";

  console.log("Server Started at http://localhost:" + port);

  server.listen(process.env.PORT || port);

  controller = require('./lib/controllers');

  app.use(new controller.BasicAuth().perform);

  app.use(new controller.Auth().perform);

  app.get('/courses', new controller.Courses().index);

  app.get('/courses/:id', new controller.Courses().show);

  app.get('/courses/:id/participants', new controller.Courses().participants);

  app.post('/courses/:id/activity', new controller.Courses().activity);

  app.get('/courses/:id/delete', new controller.Courses()["delete"]);

  app.post('/courses', new controller.Courses().create);

  app.get('/courses/:id/active_lecture', new controller.Courses().lecture);

  app.get('/courses/:id/active_lectures', new controller.Courses().lectures);

  app.post('/lectures', new controller.Lectures().create);

  app.get('/lectures/:id', new controller.Lectures().show);

  app.get('/lectures/:id/delete', new controller.Lectures()["delete"]);

  app.put('/lectures/:id', new controller.Lectures().edit);

  app.post('/registrations', new controller.Registrations().create);

  app.post('/students', new controller.Students().create);

  app.post('/upload', upload.single('upload'), new controller.Students().upload);

  app.post('/login', new controller.Auth().login);

  app["delete"]('/logout', new controller.Auth().logout);

}).call(this);
