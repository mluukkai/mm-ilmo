(function() {
  var Course, Courses, Lecture, Lectures, Registrations, Student, Students, async, models;

  async = require('async');

  models = require('./models');

  Course = models.Course;

  Student = models.Student;

  Lecture = models.Lecture;

  Courses = (function() {
    function Courses() {}

    Courses.prototype.index = function(req, res) {
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

  Lectures = (function() {
    function Lectures() {}

    Lectures.prototype.show = function(req, res) {
      return Lecture.findById(req.param('id')).populate('course', 'name term').exec(function(err, lecture) {
        if (err != null) {
          return res.json({});
        } else {
          return res.json(lecture);
        }
      });
    };

    Lectures.prototype.create = function(req, res) {
      var data, lecture;
      data = {
        date: req.param('date'),
        time: req.param('time'),
        place: req.param('place'),
        course: req.param('course_id')
      };
      lecture = new Lecture(data);
      async.parallel([
        function(callback) {
          return lecture.save(function(err) {
            if (err != null) {
              return callback(null, 'error');
            } else {
              return callback(null, 'succ');
            }
          });
        }, function(callback) {
          return Course.findById(req.param('course_id'), function(err, course) {
            course.lectures.push(lecture._id);
            return course.save(function(err) {
              if (err != null) {
                return callback(null, 'error');
              } else {
                return callback(null, 'succ');
              }
            });
          });
        }
      ], function(err, result) {
        if (err != null) {
          return res.json({});
        } else {
          return res.json(lecture);
        }
      });
      return lecture.save(function(err) {
        var _this = this;
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
    };

    return Lectures;

  })();

  exports.Lectures = Lectures;

  Registrations = (function() {
    function Registrations() {}

    Registrations.prototype.create = function(req, res) {
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
    };

    return Registrations;

  })();

  exports.Registrations = Registrations;

  Students = (function() {
    function Students() {}

    Students.prototype.create = function(req, res) {
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
            return student.save(function(err) {
              if (err != null) {
                return res.json({});
              } else {
                return res.json(student);
              }
            });
          }
        });
      });
    };

    return Students;

  })();

  exports.Students = Students;

}).call(this);
