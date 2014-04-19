(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
  ]).controller('LectureRegistrationCtrl', [
    '$scope', '$http', '$routeParams', '$timeout', function($scope, $http, $routeParams, $timeout) {
      var matches;
      matches = function(word) {
        var count, student, _i, _len, _ref;
        count = 0;
        _ref = $scope.students;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          student = _ref[_i];
          if (student.name.toUpperCase().indexOf(word) !== -1) {
            count += 1;
          }
        }
        return count;
      };
      $http.get("lectures/" + $routeParams.id).success(function(data) {
        $scope.lecture = data;
        return $http.get("courses/" + data.course._id).success(function(course) {
          $scope.students = course.participants;
          return $scope.course = course;
        });
      });
      $scope.register = function(student) {
        var data, student_id;
        student_id = student._id;
        data = {
          student_id: student_id,
          lecture_id: $routeParams.id
        };
        return $http.post("registrations", data).success(function(response) {
          $scope.lecture.participants.push(response.data.student);
          $scope.flashed = true;
          $scope.flash = "" + student.name + " registered";
          return $timeout(function() {
            $scope.flash = null;
            $scope.flashed = false;
            return $scope.search = "";
          }, 3000);
        });
      };
      $scope.search = "";
      $scope.students = [];
      $scope.flashed = false;
      $scope.registered = function(student) {
        var _ref;
        return _ref = student.number, __indexOf.call($scope.lecture.participants.map(function(p) {
          return p.number;
        }), _ref) >= 0;
      };
      return $scope.condition = function(item) {
        return $scope.search.length > 1 && item.name.toUpperCase().indexOf($scope.search.toUpperCase()) !== -1 && matches($scope.search.toUpperCase()) < 5;
      };
    }
  ]).controller('ActiveLectureCtrl', [
    '$scope', '$http', '$routeParams', '$timeout', function($scope, $http, $routeParams, $timeout) {
      var d, matches;
      matches = function(word) {
        var count, student, _i, _len, _ref;
        count = 0;
        _ref = $scope.students;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          student = _ref[_i];
          if (student.name.toUpperCase().indexOf(word) !== -1) {
            count += 1;
          }
        }
        return count;
      };
      $scope.register = function(student) {
        var data, student_id;
        student_id = student._id;
        data = {
          student_id: student_id,
          lecture_id: $scope.lecture._id
        };
        return $http.post("registrations", data).success(function(response) {
          $scope.lecture.participants.push(response.data.student);
          $scope.flashed = true;
          $scope.flash = "" + student.name + " registered";
          return $timeout(function() {
            $scope.flash = null;
            $scope.flashed = false;
            return $scope.search = "";
          }, 3000);
        });
      };
      $scope.search = "";
      $scope.students = [];
      $scope.flashed = false;
      $scope.registered = function(student) {
        var _ref;
        return _ref = student.number, __indexOf.call($scope.lecture.participants.map(function(p) {
          return p.number;
        }), _ref) >= 0;
      };
      $scope.condition = function(item) {
        return $scope.search.length > 1 && item.name.toUpperCase().indexOf($scope.search.toUpperCase()) !== -1 && matches($scope.search.toUpperCase()) < 5;
      };
      d = new Date();
      $scope.day = {
        d: d.getDate(),
        m: d.getMonth() + 1,
        y: d.getYear() + 1900
      };
      return $http.get("courses/" + $routeParams.id).success(function(course) {
        $scope.course = course;
        $scope.students = course.participants;
        return $http.get("courses/" + $routeParams.id + "/active_lecture").success(function(lecture) {
          $scope.lecture = lecture;
          return $scope.nolecture = lecture.course === void 0;
        });
      });
    }
  ]);

}).call(this);

(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
  ]).controller('CoursesCtrl', [
    '$scope', 'Course', 'Flash', function($scope, Course, Flash) {
      $scope["new"] = {};
      Course.all().then(function(course) {
        return $scope.courses = course.data;
      });
      return $scope.newCourse = function() {
        $scope.creationFormVisible = false;
        Course.create($scope["new"]).success(function(data) {
          $scope.courses.push(data);
          return Flash.set("course " + data.name + " " + data.term + " created", $scope);
        });
        return $scope["new"] = {};
      };
    }
  ]).controller('CourseCtrl', [
    '$scope', '$http', 'DateString', '$routeParams', 'Course', 'Lecture', 'Flash', function($scope, $http, DateString, $routeParams, Course, Lecture, Flash) {
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
      $scope.lecture = {
        time: "12:15",
        date: DateString.get()
      };
      $scope.registerStudent = function() {
        $scope.student.course_id = $routeParams.id;
        Course.registerStudent($scope.student).success(function(data) {
          $scope.course.participants.push(data);
          $scope.reg = false;
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
  angular.module('myApp.filters', []).filter('interpolate', [
    'version', function(version) {
      return function(text) {
        return String(text).replace(/\%VERSION\%/mg, version);
      };
    }
  ]);

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
  angular.module('registerApp').factory('koe', function() {
    return {
      test: function(koe) {
        return console.log(koe);
      }
    };
  }).factory('Lecture', function($http) {
    return {
      all: function() {
        return console.log("all");
      },
      get: function(id) {
        return $http.get("lectures/" + id);
      },
      create: function(data) {
        return $http.post('lectures', data);
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
  }).factory('DateString', function() {
    return {
      get: function() {
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
  });

}).call(this);
