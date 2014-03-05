(function() {
  var app, express, port;

  express = require('express');

  global.app = app = express();

  app.configure(function() {
    app.use(express["static"](__dirname + '/app'));
    app.use(express.bodyParser());
    app.set('views', "" + __dirname + "/app/views");
    return app.set('view engine', 'ejs');
  });

  port = "4000";

  app.listen(process.env.PORT || port);

  console.log("Server Started at http://localhost:" + port);

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
