(function() {
  var Course, Courses, Lecture, Studet, models;

  models = require('./models');

  Course = models.Course;

  Studet = models.Studet;

  Lecture = models.Lecture;

  Courses = (function() {
    function Courses() {}

    Courses.prototype.index = function(req, res) {
      console.log(req);
      return Course.find({}, function(err, courses) {
        if (err != null) {
          return res.send({});
        } else {
          return res.json(courses);
        }
      });
    };

    Courses.prototype.show = function(req, res) {
      return Course.findById(req.param('id')).populate('lectures').populate('participants').exec(function(err, course) {
        if (err != null) {
          return res.json({});
        } else {
          return res.json(course);
        }
      });
    };

    Courses.prototype.create = function(req, res) {
      var course, data;
      data = {
        name: req.param('name'),
        term: req.param('term'),
        active: req.param('active'),
        teachers: [req.param('teacher')],
        active: false
      };
      course = new Course(data);
      return course.save(function(err) {
        if (err != null) {
          return res.json({});
        } else {
          return res.json(course);
        }
      });
    };

    return Courses;

  })();

  exports.Courses = Courses;

}).call(this);
