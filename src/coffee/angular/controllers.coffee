# Controllers

angular
  .module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', ($scope)->
    ])
  .controller('MyCtrl2', ['$scope', ($scope)->
    ])

angular
  .module('registerApp')
  .controller('RegistrationCtrl', ['$scope', '$location', 'Course', ($scope, $location, Course) ->      
      Course.all().then (course) ->
      	$scope.courses = course.data 

      $scope.clicked = (id) ->
        $location.path("courses/#{id}/register")

    ])  
  .controller('LectureCtrl', ['$scope', '$routeParams', 'Lecture', 'Course', ($scope, $routeParams, Lecture, Course) ->     
      socket = io.connect()
      socket.on 'registration', (data) -> 
        $scope.lecture.participants.push data
        $scope.$apply() 

      Lecture.get($routeParams.id)
      .then( (lecture) ->	
        $scope.lecture = lecture.data
        return $scope.lecture.course._id
      )
      .then( (course_id) -> 
      	Course.get(course_id)
      )
      .then( (course) ->	
        $scope.students = course.data.participants
      )
    ])
    .controller('CoursesCtrl', ['$scope', '$timeout', '$http', 'Course', ($scope, $timeout, $http, Course) ->
        Course.all().then (course) ->
      	  $scope.courses = course.data 

        $scope.newCourse = () ->
          $scope.visible = false
          Course.create($scope.new).success (data) ->
            $scope.courses.push data
            $scope.flashed = true
            $scope.flash = "course #{data.name} #{data.term} created"
            $timeout( () ->
              $scope.flash = null
              $scope.flashed = false
            , 2500) 
          $scope.new = ""           
    ]) 
