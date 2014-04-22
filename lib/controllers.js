(function() {
  var Course, Courses, Lecture, Lectures, Registrations, Student, Students, async, models, multiparty, xlsx,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

    Courses.prototype["delete"] = function(req, res) {
      return Course.findById(req.param('id')).exec(function(err, course) {
        if (err != null) {
          return res.json({});
        } else {
          course.remove();
          return res.json("removed");
        }
      });
    };

    Courses.prototype.lecture = function(req, res) {
      var d, ds, n;
      d = new Date;
      n = function(val) {
        if (val > 10) {
          return val;
        }
        return "0" + val;
      };
      ds = "" + (d.getYear() + 1900) + "-" + (n(d.getMonth() + 1)) + "-" + (n(d.getDate()));
      console.log(ds);
      return Lecture.findOne({
        course: req.param('id'),
        date: ds
      }).populate('course', 'name term').populate('participants').exec(function(err, lectures) {
        if (err != null) {
          return res.json({});
        } else {
          return res.json(lectures);
        }
      });
    };

    Courses.prototype.lectures = function(req, res) {
      var d, ds, n;
      d = new Date;
      n = function(val) {
        if (val > 10) {
          return val;
        }
        return "0" + val;
      };
      ds = "" + (d.getYear() + 1900) + "-" + (n(d.getMonth() + 1)) + "-" + (n(d.getDate()));
      console.log(ds);
      return Lecture.find({
        course: req.param('id'),
        date: ds
      }).populate('course', 'name term').populate('participants').exec(function(err, lectures) {
        if (err != null) {
          return res.json({});
        } else {
          return res.json(lectures);
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
      return Lecture.findById(req.param('id')).populate('course', 'name term').populate('participants', 'name number').exec(function(err, lecture) {
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
        seminar: req.param('seminar'),
        course: req.param('course_id')
      };
      if (data.seminar) {
        data.speaker = req.param('speaker');
      }
      lecture = new Lecture(data);
      return async.parallel([
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
    };

    return Lectures;

  })();

  /*
  		lecture.save (err) ->
  			if err?
  				res.json {}
  			else
  				Course.findById req.param('course_id'), (err, course) =>
  					course.lectures.push lecture._id
  					course.save (err) ->
  						console.log err
  				res.json lecture
  */


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
          return Student.findById(req.param('student_id'), function(err, student) {
            var data;
            data = {
              student: student,
              lecture: lecture._id
            };
            global.io.sockets.emit('registration', student);
            return res.json({
              data: data
            });
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
      var among, buffer, course_id, extractStudent, extractStudents, form, handleExcel, isStudent, registerStudent, registerToCourse, student;
      registerStudent = function(student, course) {
        var data, new_student;
        data = {
          first_name: student.first_name,
          last_name: student.last_name,
          name: "" + student.last_name + " " + student.first_name,
          number: student.number
        };
        new_student = new Student(data);
        return new_student.save(function(err, saved_student) {
          course.participants.push(saved_student);
          console.log(course.participants);
          return course.save(function(err) {
            return console.log("saving " + saved_student.name);
          });
        });
      };
      among = function(student, participants) {
        var _ref;
        return _ref = student.number, __indexOf.call(participants.map(function(p) {
          return p.number;
        }), _ref) >= 0;
      };
      registerToCourse = function(students, course_id) {
        return Course.findById(course_id).populate('participants').exec(function(err, course) {
          var student, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = students.length; _i < _len; _i++) {
            student = students[_i];
            if (among(student, course.participants)) {
              _results.push(console.log("old: " + student.number));
            } else {
              console.log("new: " + student.number);
              _results.push(registerStudent(student, course));
            }
          }
          return _results;
        });
      };
      isStudent = function(s) {
        var nro;
        nro = s[0].value;
        return (typeof nro === 'number') && (nro.toString().charAt(0) === '1');
      };
      extractStudent = function(data) {
        return {
          number: data[0].value.toString(),
          last_name: data[2].value,
          first_name: data[3].value.replace("*", "")
        };
      };
      extractStudents = function(data) {
        var s, students, _i, _len, _ref;
        students = [];
        _ref = data.worksheets[0].data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          if (isStudent(s)) {
            students.push(extractStudent(s));
          }
        }
        console.log(students);
        return students;
      };
      student = function(data) {
        return "" + data[0].value + " " + data[2].value + " " + (data[3].value.replace("*", ""));
      };
      handleExcel = function(data) {
        var s, students, _i, _len, _ref;
        students = "";
        _ref = data.worksheets[0].data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          if (isStudent(s)) {
            students += student(s) + "\n";
          }
        }
        console.log(students);
        return students;
      };
      form = new multiparty.Form();
      buffer = null;
      course_id = null;
      form.on('part', function(part) {
        if (typeof part.filename !== 'undefined') {
          buffer = new Buffer(0);
          return part.on('data', function(chunck) {
            console.log("chunck of data");
            return buffer = Buffer.concat([buffer, chunck]);
          });
        } else {
          if (part.name === "course_id") {
            return part.on('data', function(data) {
              return course_id = data.toString();
            });
          }
        }
      });
      form.on('close', function() {
        var list, students;
        students = handleExcel(xlsx.parse(buffer));
        list = extractStudents(xlsx.parse(buffer));
        registerToCourse(list, course_id);
        return res.redirect("#courses/" + course_id);
      });
      return form.parse(req, function(err, fields, files) {});
    };

    return Students;

  })();

  exports.Students = Students;

}).call(this);
