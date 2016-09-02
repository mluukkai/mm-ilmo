(function() {
  var Auth, BasicAuth, Course, Courses, Lecture, Lectures, Registrations, Student, Students, User, async, auth, fs, models, multiparty, xlsx,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  async = require('async');

  multiparty = require('multiparty');

  xlsx = require('node-xlsx');

  fs = require('fs');

  models = require('./models');

  auth = require('basic-auth');

  Course = models.Course;

  Student = models.Student;

  Lecture = models.Lecture;

  User = models.User;

  Array.prototype.unique = function() {
    var key, output, value, _i, _ref, _results;
    output = {};
    for (key = _i = 0, _ref = this.length; 0 <= _ref ? _i < _ref : _i > _ref; key = 0 <= _ref ? ++_i : --_i) {
      output[this[key]] = this[key];
    }
    _results = [];
    for (key in output) {
      value = output[key];
      _results.push(value);
    }
    return _results;
  };

  BasicAuth = (function() {
    function BasicAuth() {
      this.perform = __bind(this.perform, this);
    }

    BasicAuth.prototype.perform = function(req, res, next) {
      var credentials, query, whitelisted, _ref;
      console.log(req.url);
      whitelisted = ['/favicon.ico', '/courses', '/students', '/login', '/registrations', '/upload'];
      if (_ref = req.url, __indexOf.call(whitelisted, _ref) >= 0) {
        return next();
      }
      if (/courses.*active_lecture/.test(req.url)) {
        return next();
      }
      if (/courses.*participants/.test(req.url)) {
        return next();
      }
      credentials = auth(req);
      console.log("kredentials:");
      console.log(credentials);
      if (!credentials) {
        res.writeHead(401, {
          'WWW-Authenticate': 'Basic realm="example"'
        });
        return res.end();
      } else {
        query = {
          user: credentials.name,
          password: credentials.pass
        };
        return User.find(query, function(err, user) {
          if (err != null) {
            return console.log(err);
          } else {
            if (user.length === 0) {
              res.writeHead(401, {
                'WWW-Authenticate': 'Basic realm="example"'
              });
              return res.end();
            } else {
              return next();
            }
          }
        });
      }
    };

    return BasicAuth;

  })();

  exports.BasicAuth = BasicAuth;

  Auth = (function() {
    function Auth() {
      this.perform = __bind(this.perform, this);
    }

    Auth.prototype.token_valid = function(token) {
      return true;
    };

    Auth.prototype.login = function(req, res) {
      var token;
      console.log(req.param('username'));
      console.log(req.param('password'));
      if (req.param('username') === req.param('password')) {
        token = '1234';
      }
      return res.send({
        token: token
      });
    };

    Auth.prototype.logout = function(req, res) {
      console.log(req.param('auth'));
      return res.send({});
    };

    Auth.prototype.perform = function(req, res, next) {
      var token, whitelisted, _ref;
      whitelisted = ['/courses', '/login', '/registrations'];
      token = req.headers['authorization'];
      if ((_ref = req.url, __indexOf.call(whitelisted, _ref) >= 0) || this.token_valid(token)) {
        return next();
      }
      if (/courses.*active_lecture/.test(req.url)) {
        return next();
      }
      if (/courses.*participants/.test(req.url)) {
        return next();
      }
      return res.send(401);
    };

    return Auth;

  })();

  exports.Auth = Auth;

  Courses = (function() {
    function Courses() {}

    Courses.prototype.index = function(req, res) {
      var token;
      token = req.headers['authorization'];
      console.log('token ' + token);
      return Course.find({}, function(err, courses) {
        if (err != null) {
          return res.send({});
        } else {
          return res.json(courses);
        }
      });
    };

    Courses.prototype.participants = function(req, res) {
      return Course.findById(req.param('id')).populate('participants').exec(function(err, course) {
        if (course.participants) {
          course.participants = course.participants.unique();
        }
        if (err != null) {
          return res.json({});
        } else {
          return res.json(course);
        }
      });
    };

    Courses.prototype.show = function(req, res) {
      return Course.findById(req.param('id')).populate('lectures').populate('participants').exec(function(err, course) {
        course.participants = course.participants.unique();
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
      var d, ds, n, token;
      token = req.headers['authorization'];
      console.log('token ' + token);
      d = new Date;
      n = function(val) {
        if (val > 9) {
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
      console.log("saving course");
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

    Lectures.prototype["delete"] = function(req, res) {
      return Lecture.findById(req.param('id')).exec(function(err, lecture) {
        if (err != null) {
          return res.json({});
        } else {
          lecture.remove();
          return res.json("removed");
        }
      });
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

    Lectures.prototype.edit = function(req, res) {
      var data;
      data = {
        date: req.param('date'),
        time: req.param('time'),
        place: req.param('place'),
        seminar: req.param('seminar'),
        course: req.param('course_id')
      };
      if (data.seminar) {
        data.speaker = req.param('speaker');
        data.opponent = req.param('opponent');
        data.chair = req.param('chair');
      }
      return Lecture.findById(req.param('id')).populate('course', 'name term').populate('participants', 'name number').exec(function(err, lecture) {
        if (err != null) {
          return res.json({});
        } else {
          if (req.param('place') != null) {
            lecture.place = req.param('place');
          }
          if (req.param('time') != null) {
            lecture.time = req.param('time');
          }
          if (req.param('date') != null) {
            lecture.date = req.param('date');
          }
          if (req.param('seminar') != null) {
            lecture.seminar = req.param('seminar');
          }
          if (req.param('speaker') != null) {
            lecture.speaker = req.param('speaker');
          }
          if (req.param('chair') != null) {
            lecture.chair = req.param('chair');
          }
          if (req.param('opponent') != null) {
            lecture.opponent = req.param('opponent');
          }
          lecture.save(function(err) {});
          if (err != null) {
            return res.json({});
          } else {
            return res.json(lecture);
          }
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
        data.opponent = req.param('opponent');
        data.chair = req.param('chair');
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
      var among, course_id, extractStudent, extractStudents, handleExcel, isStudent, list, parsed_excel, registerStudents, registerToCourse, student;
      registerStudents = function(students, course) {
        return async.each(students, function(student, callback) {
          var data, new_student;
          data = {
            first_name: student.first_name,
            last_name: student.last_name,
            name: "" + student.last_name + " " + student.first_name,
            number: student.number
          };
          new_student = new Student(data);
          return new_student.save(function(err, saved_student) {
            console.log("saving " + saved_student.name);
            course.participants.push(new_student);
            return callback(null);
          });
        }, function(result) {
          return course.save(function(err) {
            return console.log("saving course");
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
          var new_students, student, _i, _len;
          new_students = [];
          for (_i = 0, _len = students.length; _i < _len; _i++) {
            student = students[_i];
            if (among(student, course.participants)) {
              console.log("old: " + student.number);
            } else {
              new_students.push(student);
              console.log("new: " + student.number);
            }
          }
          return registerStudents(new_students, course);
        });
      };
      isStudent = function(s) {
        var nro;
        nro = s[0];
        return (typeof nro === 'string') && (nro.charAt(0) === '0') && (nro.charAt(1) === '1');
      };
      extractStudent = function(data) {
        return {
          number: data[0].substr(1),
          last_name: data[2],
          first_name: data[3].replace("*", "")
        };
      };
      extractStudents = function(data) {
        var s, students, _i, _len, _ref;
        students = [];
        _ref = data[0].data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          if (isStudent(s)) {
            students.push(extractStudent(s));
          }
        }
        return students;
      };
      student = function(data) {
        return "" + data[0] + " " + data[2] + " " + (data[3].replace("*", ""));
      };
      handleExcel = function(data) {
        var s, students, _i, _len, _ref;
        students = "";
        _ref = data[0].data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          console.log("-->  " + (isStudent(s)));
          if (isStudent(s)) {
            students += student(s) + "\n";
          }
        }
        return students;
      };
      parsed_excel = xlsx.parse(req.file.path);
      course_id = req.body.course_id;
      list = extractStudents(parsed_excel);
      registerToCourse(list, course_id);
      return res.redirect("#courses/" + course_id);
    };

    return Students;

  })();

  /*
  	upload: (req, res) ->
  		registerStudent = (student, course) ->
  			data =
  				first_name: student.first_name
  				last_name: student.last_name
  				name: "#{student.last_name} #{student.first_name}"
  				number: student.number
  			new_student = new Student(data)
  
  			new_student.save (err, saved_student) ->
  				course.participants.push saved_student
  				console.log course.participants
  				course.save (err) ->
  					console.log "saving #{saved_student.name}"
  
  		among = (student, participants) ->
  			student.number in participants.map (p) -> p.number
  
  		registerToCourse = (students, course_id) ->
  			Course.findById(course_id)
  			.populate('participants')
  			.exec (err, course) ->
  				for student in students
  					if among(student, course.participants)
  						console.log "old: #{student.number}"
  					else
  						console.log "new: #{student.number}"
  						registerStudent(student, course)
  
  		isStudent = (s) ->
  			nro = s.value
  			(typeof nro == 'number') and (nro.toString().charAt(0)=='1' )
  
  		extractStudent = (data) ->
  			{
  				number: data[0].value.toString(),
  				last_name: data[2].value,
  				first_name: data[3].value.replace("*","")
  			}
  
  		extractStudents = (data) ->
  			students = []
  			for s in data.worksheets[0].data
  				students.push extractStudent(s) if isStudent(s)
  			console.log students
  			students
  
  		student = (data) ->
  	  		"#{data[0].value} #{data[2].value} #{data[3].value.replace("*","")}"
  
  		handleExcel = (data) ->
  			students = ""
  			for s in data.worksheets[0].data
  				if isStudent(s)
  					students+= student(s) + "\n"
  			console.log students
  			students
  
  		console.log 'form start'
  
  		form = new multiparty.Form()
  		buffer = null
  		course_id = null
  
  		form.on('part', (part) ->
  			console.log "part recieved"
  			if typeof part.filename != 'undefined'
  				buffer = new Buffer(0)
  				part.on('data', (chunck) ->
  					console.log "chunck of data"
  					buffer = Buffer.concat([buffer, chunck])
  				)
  			else
  				if part.name == "course_id"
  					part.on('data', (data) ->
  						course_id = data.toString();
  					)
  		)
  
  		form.on('error', (error) ->
  			console.log "ERROR"
  			console.log erro
  		)
  
  		form.on('close', () ->
  			console.log 'closed excel'
  			console.log buffer
  
  			students = handleExcel(xlsx.parse(buffer))
  			list = extractStudents xlsx.parse(buffer)
  			registerToCourse(list, course_id)
  			res.redirect("#courses/#{course_id}");
  		)
  
  		form.parse( req, (err, fields, files) -> )
  */


  exports.Students = Students;

}).call(this);
