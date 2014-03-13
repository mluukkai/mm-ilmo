(function() {
  var Course, Lecture, RegistrationSchema, Studet, app, controller, dburl, express, io, k, libbi, models, port, server;

  express = require('express');

  global.app = app = express();

  server = require('http').createServer(app);

  io = require('socket.io').listen(server);

  app.configure(function() {
    app.use(express["static"](__dirname + '/app'));
    app.use(express.bodyParser());
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
    return socket.on('my other event', function(data) {
      io.sockets.emit('news', {
        name: data
      });
      return console.log(io.sockets);
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

  libbi = require('./lib/lib');

  libbi.koe();

  k = new libbi.Koe();

  console.log(k.foo());

  models = require('./lib/models');

  Course = models.Course;

  Studet = models.Studet;

  Lecture = models.Lecture;

  controller = require('./lib/controllers');

  app.get('/courses', new controller.Courses().index);

  app.get('/courses/:id', new controller.Courses().show);

  app.post('/courses', new controller.Courses().create);

  app.post('/lectures', function(req, res) {
    var data, lecture,
      _this = this;
    data = {
      date: req.param('date'),
      time: req.param('time'),
      place: req.param('place'),
      course: req.param('course_id')
    };
    lecture = new Lecture(data);
    return lecture.save(function(err) {
      if (err != null) {
        return res.json({});
      } else {
        Course.findById(req.param('course_id'), function(err, course) {
          course.lectures.push(lecture._id);
          return course.save(function(err) {
            return console.log(err);
          });
        });
        return res.json(lecture);
      }
    });
  });

  app.get('/lectures/:id', function(req, res) {
    return Lecture.findById(req.param('id')).populate('course', 'name term').exec(function(err, lecture) {
      if (err != null) {
        return res.json({});
      } else {
        return res.json(lecture);
      }
    });
  });

  app.post('/registrations', function(req, res) {
    var found;
    found = function(student, students) {
      var s, _i, _len;
      for (_i = 0, _len = students.length; _i < _len; _i++) {
        s = students[_i];
        if (s.toString() === student) {
          return true;
        }
      }
      return false;
    };
    return Lecture.findById(req.param('lecture_id'), function(err, lecture) {
      if (!found(req.param('student_id'), lecture.participants)) {
        lecture.participants.push(req.param('student_id'));
      }
      return lecture.save(function(err) {
        var data;
        data = {
          student: req.param('student_id'),
          lecture: lecture._id
        };
        return res.json({
          data: data
        });
      });
    });
  });

  app.post('/students', function(req, res) {
    var data, student;
    data = {
      first_name: req.param('first_name'),
      last_name: req.param('last_name'),
      name: "" + (req.param('last_name')) + " " + (req.param('first_name')),
      number: req.param('number')
    };
    student = new Student(data);
    return Course.findById(req.param('course_id'), function(err, course) {
      course.participants.push(student._id);
      return course.save(function(err) {
        if (err != null) {
          return res.json({});
        } else {
          student.save(function(err) {});
          if (err != null) {
            return res.json({});
          } else {
            return res.json(student);
          }
        }
      });
    });
  });

}).call(this);

(function() {
  var app;

  app = global.app;

  app.get('/lol', function(req, res) {
    return res.send("Hello word!");
  });

  app.get('/lolli', function(req, res) {
    return res.send("Lol word!");
  });

  app.get('/kolli', function(req, res) {
    return res.send("Lol word!");
  });

  app.get('/foo', function(req, res) {
    return res.render('index', {
      layout: false
    });
  });

}).call(this);
