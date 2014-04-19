angular
  .module('registerApp', ['ngRoute'])
  .config(['$routeProvider', ($routeProvider)->
    $routeProvider.when '/courses', 
      templateUrl: 'partials/courses.html' 
      controller: 'CoursesCtrl'
    $routeProvider.when '/courses/:id', 
      templateUrl: 'partials/course.html' 
      controller: 'CourseCtrl'
    $routeProvider.when '/courses/:id/register',
      templateUrl: 'partials/lectureRegistration.html'
      controller: 'ActiveLectureCtrl'      
    $routeProvider.when '/lectures/:id', 
      templateUrl: 'partials/lecture.html' 
      controller: 'LectureCtrl'	
    $routeProvider.when '/lectures/:id/register', 
      templateUrl: 'partials/lectureRegistration.html' 
      controller: 'LectureRegistrationCtrl'     
    $routeProvider.when '/registration',
      templateUrl: 'partials/registration.html'
      controller: 'RegistrationCtrl'
    $routeProvider.otherwise({redirectTo: '/registration'})  
  ]) 
    .controller('LectureRegistrationCtrl', ['$scope', '$http', '$routeParams', '$timeout',  ($scope, $http, $routeParams, $timeout) ->
      matches = (word) ->
        count = 0
        for student in $scope.students  
          count+=1 if student.name.toUpperCase().indexOf(word) != -1
        count 

      $http.get("lectures/#{$routeParams.id}").success (data) ->
        $scope.lecture = data
        $http.get("courses/#{data.course._id}").success (course) ->
          $scope.students = course.participants
          $scope.course = course

      $scope.register = (student) ->
        student_id = student._id
        data =
          student_id: student_id
          lecture_id: $routeParams.id
        $http.post("registrations", data).success (response) ->
          $scope.lecture.participants.push response.data.student 
          $scope.flashed = true
          $scope.flash = "#{student.name} registered"
          $timeout( () ->
            $scope.flash = null
            $scope.flashed = false
            $scope.search = ""
          , 3000) 

      $scope.search = ""
      $scope.students = []
      $scope.flashed = false

      $scope.registered = (student) ->
        student.number in $scope.lecture.participants.map (p) -> p.number 

      $scope.condition = (item) ->
        $scope.search.length>1 and item.name.toUpperCase().indexOf($scope.search.toUpperCase()) != -1 and matches($scope.search.toUpperCase())<5
    ]) 
    .controller('ActiveLectureCtrl2', ['$scope', '$http', '$routeParams', '$timeout',  ($scope, $http, $routeParams, $timeout) ->     
      matches = (word) ->
        count = 0
        for student in $scope.students  
          count+=1 if student.name.toUpperCase().indexOf(word) != -1
        count 

      $scope.register = (student) ->
        student_id = student._id
        data =
          student_id: student_id
          lecture_id: $scope.lecture._id
        $http.post("registrations", data).success (response) ->
          $scope.lecture.participants.push response.data.student 
          $scope.flashed = true
          $scope.flash = "#{student.name} registered"
          $timeout( () ->
            $scope.flash = null
            $scope.flashed = false
            $scope.search = ""
          , 3000) 

      $scope.search = ""
      $scope.students = []
      $scope.flashed = false

      $scope.registered = (student) ->
        student.number in $scope.lecture.participants.map (p) -> p.number 

      $scope.condition = (item) ->
        $scope.search.length>1 and item.name.toUpperCase().indexOf($scope.search.toUpperCase()) != -1 and matches($scope.search.toUpperCase())<5  

      d = new Date()      
      $scope.day =
        d: d.getDate()
        m: (d.getMonth()+1)
        y: (d.getYear()+1900)

      $http.get("courses/#{$routeParams.id}").success (course) ->
        $scope.course = course
        $scope.students = course.participants  
        $http.get("courses/#{$routeParams.id}/active_lecture").success (lecture) ->
          $scope.lecture = lecture
          $scope.nolecture=(lecture.course == undefined)

    ])