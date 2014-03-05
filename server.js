(function() {
  var app, dburl, express, port;

  express = require('express');

  global.app = app = express();

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

  app.listen(process.env.PORT || port);

  console.log("Server Started at http://localhost:" + port);

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
