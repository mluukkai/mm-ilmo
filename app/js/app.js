(function() {
  angular.module('registerApp', ['ngRoute']).config([
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
  ]);

}).call(this);

(function() {
  var CoursesController,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  angular.module('registerApp').controller('RegistrationCtrl', [
    '$scope', '$location', 'Course', function($scope, $location, Course) {
      Course.all().then(function(course) {
        return $scope.courses = course.data;
      });
      return $scope.clicked = function(id) {
        return $location.path("courses/" + id + "/register");
      };
    }
  ]).controller('LectureCtrl', [
    '$scope', '$routeParams', 'Lecture', 'Course', function($scope, $routeParams, Lecture, Course) {
      var socket;
      socket = io.connect();
      socket.on('registration', function(data) {
        $scope.lecture.participants.push(data);
        return $scope.$apply();
      });
      return Lecture.get($routeParams.id).then(function(lecture) {
        $scope.lecture = lecture.data;
        return $scope.lecture.course._id;
      }).then(function(course_id) {
        return Course.get(course_id);
      }).then(function(course) {
        return $scope.students = course.data.participants;
      });
    }
  ]).controller('LectureRegistrationCtrl', [
    '$scope', '$routeParams', 'Course', 'Lecture', 'Flash', 'Matcher', function($scope, $routeParams, Course, Lecture, Flash, Matcher) {
      var initialize;
      initialize = function() {
        return Lecture.get($routeParams.id).then(function(lecture) {
          $scope.lecture = lecture.data;
          return lecture.data;
        }).then(function(lecture) {
          return Course.get(lecture.course._id);
        }).then(function(course) {
          $scope.course = course.data;
          return $scope.students = course.data.participants;
        });
      };
      $scope.search = "";
      initialize();
      $scope.register = function(student) {
        return Lecture.register(student, $scope.lecture).success(function(response) {
          $scope.lecture.participants.push(response.data.student);
          Flash.set("" + student.name + " registered", $scope);
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
        return Matcher.condition(student, $scope.search, $scope.students);
      };
    }
  ]).controller('ActiveLectureCtrl', [
    '$scope', '$routeParams', 'Course', 'Lecture', 'Flash', 'Matcher', function($scope, $routeParams, Course, Lecture, Flash, Matcher) {
      var initialize;
      initialize = function() {
        Course.get($routeParams.id).success(function(course) {
          $scope.course = course;
          return $scope.students = course.participants;
        });
        return Course.activeLectureOf($routeParams.id).success(function(lecture) {
          $scope.lecture = lecture;
          return $scope.nolecture = lecture.course === void 0;
        });
      };
      $scope.search = "";
      initialize();
      $scope.register = function(student) {
        return Lecture.register(student, $scope.lecture).success(function(response) {
          $scope.lecture.participants.push(response.data.student);
          Flash.set("" + student.name + " registered", $scope);
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
        return Matcher.condition(student, $scope.search, $scope.students);
      };
    }
  ]).controller('CoursesCtrl', [
    '$scope', 'Course', 'Flash', function($scope, Course, Flash) {
      return new CoursesController($scope, Course, Flash).initialize();
    }
  ]).controller('CourseCtrl', [
    '$scope', '$routeParams', 'DateService', 'Course', 'Lecture', 'Flash', function($scope, $routeParams, DateService, Course, Lecture, Flash) {
      $scope.lecture = {
        time: "12:15",
        date: DateService.getString()
      };
      $scope.student = {};
      Course.get($routeParams.id).success(function(data) {
        return $scope.course = data;
      });
      $scope.createLecture = function() {
        $scope.lecture.course_id = $routeParams.id;
        return Lecture.create($scope.lecture).success(function(data) {
          $scope.course.lectures.push(data);
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

  CoursesController = (function() {
    function CoursesController(scope, Course, Flash) {
      this.scope = scope;
      this.Course = Course;
      this.Flash = Flash;
    }

    CoursesController.prototype.initialize = function() {
      var $scope,
        _this = this;
      $scope = this.scope;
      $scope["new"] = {};
      this.Course.all().then(function(course) {
        return $scope.courses = course.data;
      });
      return $scope.newCourse = function() {
        $scope.creationFormVisible = false;
        _this.Course.create($scope["new"]).success(function(data) {
          $scope.courses.push(data);
          return this.Flash.set("course " + data.name + " " + data.term + " created", $scope);
        });
        return $scope["new"] = {};
      };
    };

    return CoursesController;

  })();

}).call(this);

(function() {
  angular.module('registerApp').directive('togglable', function() {
    return {
      scope: {
        title: '@',
        vis: '=condition'
      },
      restrict: 'AE',
      replace: 'true',
      transclude: true,
      template: '<div><h3 ng-init="vis=false" ng-click="vis=!vis">{{title}}</h3><div ng-show="vis"><span ng-transclude></span></div></div>'
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
  angular.module('eventApp', []).controller('EventCtrl', [
    '$scope', '$http', function($scope, $http) {
      var socket;
      socket = io.connect();
      $http.get('event').success(function(data) {
        return $scope.event = data;
      });
      $scope.register = function() {
        $http.post('event', {
          name: $scope.name
        }).success(function(data) {
          return console.log("yes!");
        });
        return $scope.name = "";
      };
      return socket.on('news', function(data) {
        $scope.event.registrations.push(data);
        return $scope.$apply();
      });
    }
  ]);

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
  angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers']).config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/view1', {
        templateUrl: 'partials/partial1.html',
        controller: 'MyCtrl1'
      });
      $routeProvider.when('/view2', {
        templateUrl: 'partials/partial2.html',
        controller: 'MyCtrl2'
      });
      return $routeProvider.otherwise({
        redirectTo: '/view1'
      });
    }
  ]);

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
        search = search.toUpperCase();
        student_name = student.name.toUpperCase();
        return search.length > 1 && student_name.indexOf(search) !== -1 && mathes(search, students) < 5;
      }
    };
  });

}).call(this);
