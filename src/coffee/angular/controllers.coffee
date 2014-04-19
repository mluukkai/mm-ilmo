# Controllers

angular
  .module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', ($scope)->
    ])
  .controller('MyCtrl2', ['$scope', ($scope)->
    ])

angular
  .module('registerApp')
  .controller('RegistrationCtrl', ['$scope', '$http', '$routeParams', '$location', 'koe',  ($scope, $http, $routeParams, $location, koe) ->      
      $http.get("courses").success (data) ->
        $scope.courses = data 

      $scope.clicked = (id) ->
        $location.path("courses/#{id}/register")

      koe.test('foobar')
    ])  
  .controller('LectureCtrl', ['$scope', '$http', '$routeParams',  ($scope, $http, $routeParams) ->     
      $http.get("lectures/#{$routeParams.id}").success (data) ->
        $scope.lecture = data
        $http.get("courses/#{data.course._id}").success (course) ->
          $scope.students = course.participants
      socket = io.connect()
      socket.on 'registration', (data) -> 
        console.log data
        $scope.lecture.participants.push data
        $scope.$apply() 
    ])
