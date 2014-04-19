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
  .controller('LectureCtrl', ['$scope', '$routeParams', 'Lecture', 'Course', ($scope, $routeParams, Lecture, Course) ->     
      socket = io.connect()
      socket.on 'registration', (data) -> 
        console.log data
        $scope.lecture.participants.push data
        $scope.$apply() 

      Lecture.get($routeParams.id).then (data) ->	
        $scope.lecture = data.data
        Course.get($scope.lecture.course._id).then (course) ->	
          $scope.students = course.data.participants
    ])
