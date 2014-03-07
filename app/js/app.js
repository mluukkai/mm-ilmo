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
  angular.module('registerApp', []).config([
    '$routeProvider', function($routeProvider) {
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
      return $routeProvider.otherwise({
        redirectTo: '/events'
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
  ]);

}).call(this);

(function() {
  angular.module('myApp.services', []).value('version', '0.1');

}).call(this);
