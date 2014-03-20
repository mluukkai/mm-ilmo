(function() {
  var Course, Courses, Lecture, Lectures, Registrations, Student, Students, async, models, multiparty, xlsx;

  async = require('async');

  multiparty = require('multiparty');

  xlsx = require('node-xlsx');

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

    Lectures.prototype.respond = function(err, data) {
      if (err != null) {
        return res.json({});
      } else {
        return res.json(data);
      }
    };

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
            return callback(err, err);
          });
        }, function(callback) {
          return Course.findById(req.param('course_id'), function(err, course) {
            course.lectures.push(lecture._id);
            return course.save(function(err) {
              return callback(err, err);
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

    Students.prototype.upload = function(req, res) {
      var buffer, form, handleExcel, id, isStudent, student;
      student = function(data) {
        return "" + data[0].value + " " + data[2].value + " " + data[3].value;
      };
      isStudent = function(s) {
        var nro;
        nro = s[0].value;
        return (typeof nro === 'number') && (nro.toString().charAt(0) === '1');
      };
      handleExcel = function(data) {
        var s, students, _i, _len, _ref, _results;
        students = "";
        _ref = data.worksheets[0].data;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          if (isStudent(s)) {
            _results.push(students += student(s) + "\n");
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      console.log("entered");
      console.log("request started");
      console.log(req.body);
      console.log(req.files);
      id = req.param('course_id');
      console.log("entered " + id);
      form = new multiparty.Form();
      buffer = null;
      console.log("formi");
      form.on('part', function(part) {
        console.log("part");
        buffer = new Buffer(0);
        return part.on('data', function(chunck) {
          console.log("chunck");
          return buffer = Buffer.concat([buffer, chunck]);
        });
      });
      form.on('close', function() {
        var students;
        console.log("closed");
        students = handleExcel(xlsx.parse(buffer));
        res.writeHead(200, {
          'content-type': 'text/plain'
        });
        res.write(students.toString("utf8"));
        return res.end();
      });
      return form.parse(req, function(err, fields, files) {});
    };

    return Students;

  })();

  exports.Students = Students;

}).call(this);
