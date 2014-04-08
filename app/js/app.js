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
  angular.module('myApp.controllers', []).controller('MyCtrl1', ['$scope', function($scope) {}]).controller('MyCtrl2', ['$scope', function($scope) {}]);

}).call(this);

(function() {
  angular.module('myApp.directives', []).directive('appVersion', [
    'version', function(version) {
      return function(scope, elm, attrs) {
        return elm.text(version);
      };
    }
  ]);

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

}).call(this);

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
      $routeProvider.when('/lectures/:id', {
        templateUrl: 'partials/lecture.html',
        controller: 'LectureCtrl'
      });
      $routeProvider.when('/lectures/:id/register', {
        templateUrl: 'partials/lectureRegistration.html',
        controller: 'LectureRegistrationCtrl'
      });
      $routeProvider.when('/active', {
        templateUrl: 'partials/active.html',
        controller: 'ActiveEventCtrl'
      });
      $routeProvider.when('/events', {
        templateUrl: 'partials/events.html',
        controller: 'EventsCtrl'
      });
      $routeProvider.when('/events/:id', {
        templateUrl: 'partials/event.html',
        controller: 'EventCtrl'
      });
      $routeProvider.when('/registration', {
        templateUrl: 'partials/registration.html',
        controller: 'RegistrationCtrl'
      });
      return $routeProvider.when('/courses/:id/register', {
        templateUrl: 'partials/lectureRegistration.html',
        controller: 'ActiveLectureCtrl'
      });
    }
  ]).controller('ActiveEventCtrl', [
    '$scope', '$http', function($scope, $http) {
      var socket;
      $scope.msg = "msg2";
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
  ]).controller('EventsCtrl', [
    '$scope', '$http', function($scope, $http) {
      $scope.msg = "msg";
      return $http.get('events').success(function(data) {
        return $scope.events = data;
      });
    }
  ]).controller('EventCtrl', [
    '$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
      $scope.msg = $routeParams.id;
      console.log($routeParams.id);
      return $http.get("events/" + $routeParams.id).success(function(data) {
        return $scope.event = data;
      });
    }
  ]).controller('CoursesCtrl', [
    '$scope', '$http', '$timeout', function($scope, $http, $timeout) {
      /*
      $scope.new = 
        name: 'ohtu'
        term: 'sprinr 2014'
        teacher: 'mluukkai'
      */

      $http.get("courses").success(function(data) {
        return $scope.courses = data;
      });
      return $scope.newCourse = function() {
        console.log($scope["new"]);
        $scope.visible = false;
        $http.post('courses', $scope["new"]).success(function(data) {
          console.log(data);
          $scope.courses.push(data);
          $scope.flashed = true;
          $scope.flash = "course " + data.name + " " + data.term + " created";
          return $timeout(function() {
            $scope.flash = null;
            return $scope.flashed = false;
          }, 2500);
        });
        return $scope["new"] = "";
      };
    }
  ]).controller('CourseCtrl', [
    '$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
      var day, month, today;
      $http.get("courses/" + $routeParams.id).success(function(data) {
        return $scope.course = data;
      });
      $scope.createLecture = function() {
        $scope.lecture.course_id = $routeParams.id;
        return $http.post('lectures', $scope.lecture).success(function(data) {
          console.log(data);
          $scope.course.lectures.push(data);
          return $scope.createLectureForm = false;
        });
      };
      $scope.registerStudent = function() {
        $scope.student.course_id = $routeParams.id;
        $http.post('students', $scope.student).success(function(data) {
          console.log(data);
          return $scope.course.participants.push(data);
        });
        return $scope.student = {};
      };
      $scope.registered = function(student, lecture) {
        var _ref;
        if (_ref = student._id, __indexOf.call(lecture.participants, _ref) >= 0) {
          return "  X";
        }
        return "";
      };
      today = new Date();
      month = "" + (today.getMonth() + 1);
      if ((today.getMonth() + 1) < 10) {
        month = "0" + month;
      }
      day = "" + (today.getDate());
      if (today.getDate() < 10) {
        day = "0" + day;
      }
      return $scope.lecture = {
        place: 'exactum',
        time: "12:15",
        date: "" + (today.getYear() + 1900) + "-" + month + "-" + day
      };
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
  ]).controller('LectureCtrl', [
    '$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
      return $http.get("lectures/" + $routeParams.id).success(function(data) {
        var socket;
        $scope.lecture = data;
        $http.get("courses/" + data.course._id).success(function(course) {
          return $scope.students = course.participants;
        });
        socket = io.connect();
        return socket.on('registration', function(data) {
          console.log(data);
          $scope.lecture.participants.push(data);
          return $scope.$apply();
        });
      });
    }
  ]).controller('RegistrationCtrl', [
    '$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {
      $http.get("courses").success(function(data) {
        return $scope.courses = data;
      });
      return $scope.clicked = function(id) {
        return $location.path("courses/" + id + "/register");
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
  ]).filter('date', function() {
    return function(date) {
      var parts;
      parts = date.split("-");
      return "" + parts[2] + "." + parts[1];
    };
  });

}).call(this);

(function() {
  angular.module('myApp.services', []).value('version', '0.1');

}).call(this);
