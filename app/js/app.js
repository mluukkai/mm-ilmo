(function() {
  angular.module('registerApp', ['ngRoute', 'ui.bootstrap', 'dialogs']).config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/courses', {
        templateUrl: 'partials/courses.html',
        controller: 'CoursesCtrl'
      });
      $routeProvider.when('/courses/:id', {
        templateUrl: 'partials/course.html',
        controller: 'CourseCtrl'
      });
      $routeProvider.when('/courses/:id/register', {
        templateUrl: 'partials/lectureRegistration.html',
        controller: 'ActiveLectureCtrl'
      });
      $routeProvider.when('/lectures/:id', {
        templateUrl: 'partials/lecture.html',
        controller: 'LectureCtrl'
      });
      $routeProvider.when('/lectures/:id/register', {
        templateUrl: 'partials/lectureRegistration.html',
        controller: 'LectureRegistrationCtrl'
      });
      $routeProvider.when('/registration', {
        templateUrl: 'partials/registration.html',
        controller: 'RegistrationCtrl'
      });
      return $routeProvider.otherwise({
        redirectTo: '/registration'
      });
    }
  ]).config([
    '$httpProvider', function($httpProvider) {
      return $httpProvider.responseInterceptors.push('myInterceptor');
    }
  ]);

}).call(this);

(function() {
  var CoursesController, RegistrationController,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  angular.module('registerApp').controller('RegistrationCtrl', [
    '$dialogs', '$scope', '$location', 'Course', function($dialogs, $scope, $location, Course) {
      Course.all().then(function(course) {
        return $scope.courses = course.data;
      });
      $scope.test2 = function() {
        var dlg;
        dlg = $dialogs.create('partials/logindialog.html', 'LoginModalCtrl', {}, {});
        return dlg.result.then(function(data) {
          return console.log(data);
        }, function(data) {
          return console.log(data);
        });
      };
      return $scope.clicked = function(id) {
        return $location.path("courses/" + id + "/register");
      };
    }
  ]).controller('LoginModalCtrl', [
    '$scope', '$modalInstance', 'data', function($scope, $modalInstance, data) {
      $scope.user = {};
      $scope.login = function() {
        return $modalInstance.close($scope.user);
      };
      return $scope.kansel = function() {
        return $modalInstance.dismiss('Canceled');
      };
    }
  ]).controller('LectureCtrl', [
    '$scope', '$routeParams', 'Lecture', 'Course', 'Flash', function($scope, $routeParams, Lecture, Course, Flash) {
      var socket;
      socket = io.connect();
      socket.on('registration', function(data) {
        $scope.lecture.participants.push(data);
        return $scope.$apply();
      });
      Lecture.get($routeParams.id).then(function(lecture) {
        $scope.lecture = lecture.data;
        $scope.editedLecture = angular.copy($scope.lecture);
        return $scope.lecture.course._id;
      }).then(function(course_id) {
        return Course.get(course_id);
      }).then(function(course) {
        return $scope.students = course.data.participants;
      });
      return $scope.saveLecture = function() {
        $scope.lecture = angular.copy($scope.editedLecture);
        return Lecture.save($routeParams.id, $scope.lecture).success(function(data) {
          $scope.editformVisible = false;
          return Flash.set("changes saved", $scope);
        });
      };
    }
  ]).controller('LectureRegistrationCtrl', [
    '$scope', '$routeParams', 'Course', 'Lecture', 'Flash', 'Matcher', function($scope, $routeParams, Course, Lecture, Flash, Matcher) {
      var ctrl, p;
      p = {
        scope: $scope,
        id: $routeParams.id,
        Lecture: Lecture,
        Course: Course,
        Flash: Flash,
        Matcher: Matcher
      };
      ctrl = new RegistrationController(p);
      return ctrl.initialize_lecture().run();
    }
  ]).controller('ActiveLectureCtrl', [
    '$scope', '$timeout', '$location', '$route', '$routeParams', 'Course', 'Lecture', 'Flash', 'Matcher', 'DateService', function($scope, $timeout, $location, $route, $routeParams, Course, Lecture, Flash, Matcher, DateService) {
      var ctrl, p;
      p = {
        scope: $scope,
        id: $routeParams.id,
        Lecture: Lecture,
        Course: Course,
        Flash: Flash,
        Matcher: Matcher,
        DateService: DateService,
        timeout: $timeout,
        location: $location,
        route: $route
      };
      ctrl = new RegistrationController(p);
      return ctrl.initialize_actives().run();
    }
  ]).controller('CoursesCtrl', [
    '$scope', 'Course', 'Flash', function($scope, Course, Flash) {
      var p;
      p = {
        scope: $scope,
        Course: Course,
        Flash: Flash
      };
      return new CoursesController(p).run();
    }
  ]).controller('CourseCtrl', [
    '$scope', '$routeParams', 'DateService', 'Course', 'Lecture', 'Flash', function($scope, $routeParams, DateService, Course, Lecture, Flash) {
      var init_lecture, time,
        _this = this;
      init_lecture = function() {
        return $scope.lecture = {
          time: "12:15",
          date: DateService.getString()
        };
      };
      time = function(s) {
        var d, t;
        t = s.time.split(':');
        d = s.date.split('-');
        return 1500 * (31 * parseInt(d[1], 10) + parseInt(d[2], 10)) + 60 * parseInt(t[0], 10) + parseInt(t[1], 10);
      };
      $scope.student_number = /0\d{8}$/;
      $scope.student = {};
      init_lecture();
      Course.get($routeParams.id).success(function(data) {
        $scope.course = data;
        return $scope.course.lectures = $scope.course.lectures.sort(function(a, b) {
          return time(a) - time(b);
        });
      });
      $scope.createLecture = function() {
        $scope.lecture.course_id = $routeParams.id;
        return Lecture.create($scope.lecture).success(function(data) {
          $scope.course.lectures.push(data);
          init_lecture();
          $scope.course.lectures = $scope.course.lectures.sort(function(a, b) {
            return time(a) - time(b);
          });
          return $scope.createLectureFormVisible = false;
        });
      };
      $scope.registerStudent = function() {
        $scope.student.course_id = $routeParams.id;
        Course.registerStudent($scope.student).success(function(data) {
          $scope.course.participants.push(data);
          $scope.registrationFormVisible = false;
          return Flash.set("registered " + data.name + " to course", $scope);
        });
        return $scope.student = {};
      };
      return $scope.registered = function(student, lecture) {
        var _ref;
        if (_ref = student._id, __indexOf.call(lecture.participants, _ref) >= 0) {
          return "  X";
        }
        return "";
      };
    }
  ]);

  /*
    Controller classes
  */


  CoursesController = (function() {
    function CoursesController(p) {
      this.p = p;
    }

    CoursesController.prototype.run = function() {
      var $scope,
        _this = this;
      $scope = this.p.scope;
      $scope["new"] = {};
      this.p.Course.all().then(function(course) {
        return $scope.courses = course.data;
      });
      return $scope.newCourse = function() {
        $scope.creationFormVisible = false;
        _this.p.Course.create($scope["new"]).success(function(data) {
          $scope.courses.push(data);
          return _this.p.Flash.set("course " + data.name + " " + data.term + " created", $scope);
        });
        return $scope["new"] = {};
      };
    };

    return CoursesController;

  })();

  RegistrationController = (function() {
    function RegistrationController(p) {
      this.p = p;
      this.initialize_actives = __bind(this.initialize_actives, this);
      this.current_of = __bind(this.current_of, this);
    }

    RegistrationController.prototype.initialize_lecture = function() {
      var $scope,
        _this = this;
      $scope = this.p.scope;
      this.p.Lecture.get(this.p.id).then(function(lecture) {
        $scope.lecture = lecture.data;
        return lecture.data;
      }).then(function(lecture) {
        return _this.p.Course.get(lecture.course._id);
      }).then(function(course) {
        $scope.course = course.data;
        return $scope.students = course.data.participants;
      });
      return this;
    };

    RegistrationController.prototype.initialize_active = function() {
      var $scope;
      $scope = this.p.scope;
      this.p.Course.get(this.p.id).success(function(course) {
        $scope.course = course;
        return $scope.students = course.participants;
      });
      this.p.Course.activeLectureOf(this.p.id).success(function(lecture) {
        $scope.lecture = lecture;
        return $scope.nolecture = lecture.course === void 0;
      });
      return this;
    };

    RegistrationController.prototype.current_of = function(lectures) {
      var diff, next_lecture, no_started, one_after, started, time,
        _this = this;
      time = function(s) {
        var t;
        t = s.time.split(':');
        return parseInt(t[0], 10) * 60 + parseInt(t[1], 10);
      };
      lectures = lectures.sort(function(a, b) {
        return time(a) - time(b);
      });
      no_started = lectures.filter(function(l) {
        return time(l) > _this.p.DateService.now();
      });
      started = lectures.filter(function(l) {
        return time(l) <= _this.p.DateService.now();
      });
      started = started.sort(function(a, b) {
        return time(b) - time(a);
      });
      next_lecture = started[0] || no_started[0];
      one_after = null;
      if (no_started.length > 0) {
        one_after = no_started[0];
      }
      diff = -1;
      if (one_after != null) {
        diff = time(one_after) - this.p.DateService.now();
      }
      console.log(diff);
      return [next_lecture, diff];
    };

    RegistrationController.prototype.initialize_actives = function() {
      var $scope,
        _this = this;
      $scope = this.p.scope;
      this.p.Course.get(this.p.id).success(function(course) {
        $scope.course = course;
        return $scope.students = course.participants;
      });
      this.p.Course.activeLecturesOf(this.p.id).then(function(lectures) {
        return lectures.data;
      }).then(function(lectures) {
        var current_lecture, time_diff, _ref;
        $scope.nolecture = lectures.length === 0;
        if (lectures.length > 0) {
          _ref = _this.current_of(lectures), current_lecture = _ref[0], time_diff = _ref[1];
          $scope.lecture = current_lecture;
        }
        return time_diff;
      }).then(function(time_diff) {
        var DELTA, MINUTE, delay;
        console.log("time diff: " + time_diff);
        _this.old_location = _this.p.location.path();
        if (time_diff >= 0) {
          console.log("timeout set");
          MINUTE = 60000;
          DELTA = 10000;
          delay = MINUTE * time_diff + DELTA;
          console.log("delay min: " + delay / 60000);
          return _this.p.timeout(function() {
            console.log("timeout fired");
            if (_this.old_location === _this.p.location.path()) {
              console.log("should reload");
              return _this.p.route.reload();
            }
          }, delay);
        }
      });
      return this;
    };

    RegistrationController.prototype.run = function() {
      var $scope,
        _this = this;
      $scope = this.p.scope;
      $scope.student = {};
      $scope.student_number = /0\d{8}$/;
      $scope.registerNewStudent = function() {
        $scope.student.course_id = $scope.lecture.course._id;
        _this.p.Course.registerStudent($scope.student).then(function(student) {
          $scope.students.push(student.data);
          $scope.registrationFormVisible = false;
          return student.data;
        }).then(function(student) {
          return _this.p.Lecture.register(student, $scope.lecture);
        }).then(function(response) {
          return response.data.data.student;
        }).then(function(student) {
          $scope.lecture.participants.push(student);
          _this.p.Flash.set("" + student.name + " added to course and registered", $scope);
          return $scope.search = "";
        });
        return $scope.student = {};
      };
      $scope.register = function(student) {
        return _this.p.Lecture.register(student, $scope.lecture).success(function(response) {
          $scope.lecture.participants.push(response.data.student);
          _this.p.Flash.set("" + student.name + " registered", $scope);
          return $scope.search = "";
        });
      };
      $scope.registered = function(student) {
        var _ref;
        return _ref = student.number, __indexOf.call($scope.lecture.participants.map(function(p) {
          return p.number;
        }), _ref) >= 0;
      };
      return $scope.condition = function(student) {
        return _this.p.Matcher.condition(student, $scope.search, $scope.students);
      };
    };

    return RegistrationController;

  })();

}).call(this);

(function() {
  angular.module('registerApp').directive('togglable', function() {
    return {
      scope: {
        title: '@',
        alternative: '@',
        vis: '=condition'
      },
      restrict: 'AE',
      replace: 'true',
      transclude: true,
      templateUrl: 'partials/togglable.html',
      link: function(scope) {
        var nonvis;
        nonvis = scope.alternative || scope.title;
        scope.titles = {};
        scope.titles.nonvis = scope.title;
        return scope.titles.vis = nonvis;
      }
    };
  }).directive('flash', function() {
    return {
      scope: false,
      restrict: 'AE',
      replace: 'true',
      template: '<div ng-show="flashed" class="alert alert-success">{{flash}}</div>'
    };
  });

}).call(this);

(function() {
  angular.module('registerApp').filter('date', function() {
    return function(date) {
      var parts;
      if (date == null) {
        return "";
      }
      parts = date.split("-");
      return "" + parts[2] + "." + parts[1];
    };
  });

}).call(this);

(function() {
  angular.module('registerApp').factory('Lecture', function($http) {
    return {
      all: function() {
        return console.log("all");
      },
      get: function(id) {
        return $http.get("lectures/" + id);
      },
      save: function(id, data) {
        return $http.put("lectures/" + id, data);
      },
      create: function(data) {
        return $http.post('lectures', data);
      },
      register: function(student, lecture) {
        var data;
        data = {
          student_id: student._id,
          lecture_id: lecture._id
        };
        return $http.post("registrations", data);
      }
    };
  }).factory('Course', function($http) {
    return {
      all: function() {
        return $http.get("courses");
      },
      get: function(id) {
        return $http.get("courses/" + id);
      },
      create: function(data) {
        return $http.post('courses', data);
      },
      activeLectureOf: function(id) {
        return $http.get("courses/" + id + "/active_lecture");
      },
      activeLecturesOf: function(id) {
        return $http.get("courses/" + id + "/active_lectures");
      },
      registerStudent: function(data) {
        return $http.post('students', data);
      }
    };
  }).factory('Flash', function($timeout) {
    return {
      set: function(message, scope) {
        scope.flashed = true;
        scope.flash = message;
        return $timeout(function() {
          scope.flash = null;
          return scope.flashed = false;
        }, 2500);
      }
    };
  }).factory('DateService', function() {
    return {
      getString: function() {
        var day, month, today;
        today = new Date();
        month = "" + (today.getMonth() + 1);
        if ((today.getMonth() + 1) < 10) {
          month = "0" + month;
        }
        day = "" + (today.getDate());
        if (today.getDate() < 10) {
          day = "0" + day;
        }
        return "" + (today.getYear() + 1900) + "-" + month + "-" + day;
      },
      now: function() {
        var d, now, t;
        d = new Date();
        now = "" + d.getHours() + ":" + d.getMinutes();
        t = now.split(':');
        return parseInt(t[0], 10) * 60 + parseInt(t[1], 10);
      }
    };
  }).factory('Matcher', function() {
    var mathes;
    mathes = function(word, students) {
      var count, student, _i, _len;
      count = 0;
      for (_i = 0, _len = students.length; _i < _len; _i++) {
        student = students[_i];
        if (student.name.toUpperCase().indexOf(word) !== -1) {
          count += 1;
        }
      }
      return count;
    };
    return {
      condition: function(student, search, students) {
        var student_name;
        if (search == null) {
          search = "";
        }
        search = search.toUpperCase();
        student_name = student.name.toUpperCase();
        return search.length > 1 && student_name.indexOf(search) !== -1 && mathes(search, students) < 5;
      }
    };
  }).factory('myInterceptor', function($q) {
    return function(promise) {
      return promise.then(function(response) {
        return response;
      }, function(response) {
        return $q.reject(response);
      });
    };
  });

}).call(this);
