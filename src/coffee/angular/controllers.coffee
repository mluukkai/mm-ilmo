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
    .controller('LectureRegistrationCtrl', ['$scope', '$routeParams', 'Course', 'Lecture', 'Flash', 'Matcher',  ($scope, $routeParams, Course, Lecture, Flash, Matcher) ->

      initialize = ->
        Lecture.get($routeParams.id)
        .then(
          (lecture) -> 
            $scope.lecture = lecture.data
            lecture.data
        ).then(
          (lecture) ->
            Course.get(lecture.course._id)
        ).then(
          (course) ->
            $scope.course = course.data
            $scope.students = course.data.participants  
        )

      $scope.search = ""

      initialize()

      ctrl = new RegistrationController($scope, $routeParams.id, Course, Lecture, Flash, Matcher)
      ctrl.initialize()

    ]) 
    .controller('ActiveLectureCtrl', ['$scope', '$routeParams', 'Course', 'Lecture', 'Flash', 'Matcher', ($scope, $routeParams, Course, Lecture, Flash, Matcher) ->     
      initialize = ->
        Course.get($routeParams.id).success (course) ->
          $scope.course = course
          $scope.students = course.participants  
        Course.activeLectureOf($routeParams.id).success (lecture) ->
          $scope.lecture = lecture
          $scope.nolecture = (lecture.course == undefined)

      $scope.search = ""

      initialize()

      $scope.register = (student) ->
        Lecture.register(student, $scope.lecture).success (response) ->
          $scope.lecture.participants.push response.data.student 
          Flash.set("#{student.name} registered", $scope)
          $scope.search = ""

      $scope.registered = (student) ->
        student.number in $scope.lecture.participants.map (p) -> p.number 

      $scope.condition = (student) ->
        Matcher.condition(student, $scope.search, $scope.students)

    ])
    .controller('CoursesCtrl', ['$scope', 'Course', 'Flash', ($scope, Course, Flash) ->
        new CoursesController($scope, Course, Flash).initialize() 
    ]) 
    .controller('CourseCtrl', ['$scope', '$routeParams', 'DateService', 'Course', 'Lecture', 'Flash', ($scope, $routeParams, DateService, Course, Lecture, Flash) ->
        $scope.lecture = 
            time: "12:15"
            date: DateService.getString()  
        $scope.student = {}     

        Course.get($routeParams.id).success (data) ->
          $scope.course = data

        $scope.createLecture = ->
          $scope.lecture.course_id = $routeParams.id
          Lecture.create($scope.lecture).success (data) ->
            $scope.course.lectures.push(data)
            $scope.createLectureFormVisible = false   

        $scope.registerStudent = ->
          $scope.student.course_id = $routeParams.id
          Course.registerStudent($scope.student).success (data) ->
            $scope.course.participants.push data
            $scope.registrationFormVisible = false
            Flash.set("registered #{data.name} to course", $scope)
          $scope.student = {} 

        $scope.registered = (student, lecture) ->
          return "  X" if student._id in lecture.participants
          return ""        
    ])     

class CoursesController
  constructor: (@scope, @Course, @Flash) ->

  initialize: () ->  
    $scope = @scope

    $scope.new = {}
    @Course.all().then (course) =>
      $scope.courses = course.data

    $scope .newCourse = () =>  
      $scope.creationFormVisible = false
      @Course.create($scope.new).success (data) ->
        $scope.courses.push data          
        @Flash.set("course #{data.name} #{data.term} created", $scope )
      $scope.new = {} 

class RegistrationController
  constructor: (@scope, @id, @Course, @Lecture, @Flash, @Matcher) ->    

  initialize: () ->
    $scope = @scope

    $scope.register = (student) ->
      @Lecture.register(student, $scope.lecture).success (response) =>
        $scope.lecture.participants.push response.data.student 
        @Flash.set("#{student.name} registered", $scope)
        $scope.search = ""

    $scope.registered = (student) ->
      student.number in $scope.lecture.participants.map (p) -> p.number 

    $scope.condition = (student) ->
      @Matcher.condition(student, $scope.search, $scope.students)  
