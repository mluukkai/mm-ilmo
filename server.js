(function() {
  var RegistrationSchema, app, controller, dburl, express, port, server;

  express = require('express');

  global.app = app = express();

  server = require('http').createServer(app);

  global.io = require('socket.io').listen(server);

  app.configure(function() {
    app.use(express["static"](__dirname + '/app'));
    app.use(express.json()).use(express.urlencoded());
    app.set('views', "" + __dirname + "/app/views");
    return app.set('view engine', 'ejs');
  });

  global.mongoose = require('mongoose');

  global.Schema = mongoose.Schema;

  global.ObjectId = Schema.ObjectId;

  dburl = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/mydb";

  mongoose.connect(dburl);

  port = "4000";

  console.log("Server Started at http://localhost:" + port);

  server.listen(process.env.PORT || port);

  io.configure(function() {
    io.set("transports", ["xhr-polling"]);
    return io.set("polling duration", 20);
  });

  io.sockets.on('connection', function(socket) {
    console.log("new socket registered");
    console.log(io.sockets);
    socket.emit('news', {
      name: 'joined'
    });
    socket.on('my other event', function(data) {
      io.sockets.emit('news', {
        name: data
      });
      return console.log(io.sockets);
    });
    return socket.on('register', function(data) {
      io.sockets.emit('registration', data);
      return console.log(data);
    });
  });

  global.Todo = mongoose.model('Todo', new Schema({
    id: ObjectId,
    title: {
      type: String
    },
    state: {
      type: String
    },
    created_at: {
      type: Date,
      "default": Date.now
    }
  }));

  app.get('/mongo', function(req, res) {
    return res.send("Mongo word!");
  });

  app.get('/mongot/:id', function(req, res) {
    var _this = this;
    return Todo.findById(req.param('id'), function(err, todo) {
      _this.todo = todo;
      if (err != null) {
        return res.send("no found " + (req.param('id')));
      } else {
        return res.json(_this.todo);
      }
    });
  });

  app["delete"]('/mongot/:id', function(req, res) {
    var _this = this;
    return Todo.findById(req.param('id'), function(err, todo) {
      _this.todo = todo;
      if (err != null) {
        return res.send("no found " + (req.param('id')));
      } else {
        _this.todo.remove();
        return res.json(_this.todo);
      }
    });
  });

  app.post('/mongot', function(req, res) {
    var todo,
      _this = this;
    todo = new Todo({
      title: req.param('title'),
      state: req.param('state')
    });
    return todo.save(function(err) {
      if (err != null) {
        return res.json({});
      } else {
        return res.json(todo);
      }
    });
  });

  app.get('/mongot', function(req, res) {
    var _this = this;
    return Todo.find({}, function(err, todos) {
      _this.todos = todos;
      if (err != null) {
        return res.send("bad");
      } else {
        return res.json(_this.todos);
      }
    });
  });

  RegistrationSchema = new Schema({
    id: ObjectId,
    name: String,
    created_at: {
      type: Date,
      "default": Date.now
    }
  });

  global.Registration = mongoose.model('Registration', RegistrationSchema);

  global.Event = mongoose.model('Event', new Schema({
    id: ObjectId,
    name: String,
    test: String,
    active: Boolean,
    registrations: [RegistrationSchema],
    created_at: {
      type: Date,
      "default": Date.now
    }
  }));

  app.get('/reset', function(req, res) {
    var _this = this;
    return Event.update({
      active: true
    }, {
      $set: {
        active: false
      }
    }, function(err) {
      return res.send({});
    });
  });

  app.post('/events', function(req, res) {
    var event,
      _this = this;
    event = new Event({
      name: req.param('name'),
      active: req.param('active')
    });
    return event.save(function(err) {
      if (err != null) {
        return res.json({});
      } else {
        return res.json(event);
      }
    });
  });

  app.get('/events', function(req, res) {
    var _this = this;
    return Event.find({}, function(err, events) {
      _this.events = events;
      if (err != null) {
        return res.send({});
      } else {
        return res.json(_this.events);
      }
    });
  });

  app.get('/events/:id', function(req, res) {
    var _this = this;
    return Event.findById(req.param('id'), function(err, event) {
      _this.event = event;
      if (err != null) {
        return res.json({});
      } else {
        return res.json(_this.event);
      }
    });
  });

  app.get('/event', function(req, res) {
    return Event.findOne({
      active: true
    }, function(err, event) {
      if (err != null) {
        return res.send(new Event({
          name: "Luento"
        }));
      } else {
        return res.send(event);
      }
    });
  });

  app.post('/event', function(req, res) {
    return Event.findOne({
      active: true
    }, function(err, event) {
      var r,
        _this = this;
      if (err != null) {
        event(new Event({
          name: "Luento"
        }));
      }
      console.log(event);
      r = new Registration({
        name: req.param('name')
      });
      event.registrations.push(r);
      io.sockets.emit('news', r);
      return event.save(function(err) {
        if (err != null) {
          return res.json({});
        } else {
          return res.json(event);
        }
      });
    });
  });

  controller = require('./lib/controllers');

  app.get('/courses', new controller.Courses().index);

  app.get('/courses/:id', new controller.Courses().show);

  app.post('/courses', new controller.Courses().create);

  app.get('/courses/:id/active_lecture', new controller.Courses().lecture);

  app.post('/lectures', new controller.Lectures().create);

  app.get('/lectures/:id', new controller.Lectures().show);

  app.post('/registrations', new controller.Registrations().create);

  app.post('/students', new controller.Students().create);

  app.post('/upload', new controller.Students().upload);

}).call(this);
