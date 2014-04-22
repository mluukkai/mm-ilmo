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
      p = 
          scope: $scope
          id: $routeParams.id 
          Lecture: Lecture
          Course: Course
          Flash: Flash
          Matcher: Matcher
      ctrl = new RegistrationController(p)
      ctrl.initialize_lecture().run()
    ]) 
    .controller('ActiveLectureCtrl', ['$scope', '$routeParams', 'Course', 'Lecture', 'Flash', 'Matcher', 'DateService', ($scope, $routeParams, Course, Lecture, Flash, Matcher, DateService) ->     
      p = 
          scope: $scope
          id: $routeParams.id 
          Lecture: Lecture
          Course: Course
          Flash: Flash
          Matcher: Matcher
          DateService: DateService
      ctrl = new RegistrationController(p)
      #initialize_actives
      ctrl.initialize_actives().run()
    ])
    .controller('CoursesCtrl', ['$scope', 'Course', 'Flash', ($scope, Course, Flash) ->
        p = 
          scope: $scope
          Course: Course
          Flash: Flash
        new CoursesController(p).run() 
    ]) 
    .controller('CourseCtrl', ['$scope', '$routeParams', 'DateService', 'Course', 'Lecture', 'Flash', ($scope, $routeParams, DateService, Course, Lecture, Flash) ->
        init_lecture = =>
          $scope.lecture = 
            time: "12:15"
            date: DateService.getString() 

        time = ( s ) -> 
          t = s.time.split(':')
          d = s.date.split('-')
          1500*(31*parseInt(d[1],10)+parseInt(d[2],10)) + 60*parseInt(t[0],10)+parseInt(t[1],10)
 
        $scope.student = {}     
        init_lecture()

        Course.get($routeParams.id).success (data) ->
          $scope.course = data
          $scope.course.lectures = $scope.course.lectures.sort (a,b) -> time(a)-time(b)

        $scope.createLecture = ->
          $scope.lecture.course_id = $routeParams.id
          Lecture.create($scope.lecture).success (data) ->
            $scope.course.lectures.push(data)
            init_lecture()
            $scope.course.lectures = $scope.course.lectures.sort (a,b) -> time(a)-time(b)
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

###
  Controller classes
###

class CoursesController
  constructor: (@p) ->

  run: () -> 
    $scope = @p.scope

    $scope.new = {}
    @p.Course.all().then (course) =>
      $scope.courses = course.data

    $scope.newCourse = () =>  
      $scope.creationFormVisible = false
      @p.Course.create($scope.new).success (data) =>
        $scope.courses.push data          
        @p.Flash.set("course #{data.name} #{data.term} created", $scope )
      $scope.new = {} 


class RegistrationController
  constructor: (@p) ->    

  initialize_lecture: ->
    $scope = @p.scope

    @p.Lecture.get(@p.id)
    .then(
      (lecture) => 
        $scope.lecture = lecture.data
        lecture.data
    ).then(
      (lecture) =>
        @p.Course.get(lecture.course._id)
    ).then(
      (course) =>
        $scope.course = course.data
        $scope.students = course.data.participants  
    )
    this

  initialize_active: ->
    $scope = @p.scope

    @p.Course.get(@p.id).success (course) ->
      $scope.course = course
      $scope.students = course.participants  
    @p.Course.activeLectureOf(@p.id).success (lecture) ->
      $scope.lecture = lecture
      $scope.nolecture = (lecture.course == undefined)
    this

  current_of: ( lectures ) =>
    time = ( s ) -> 
      t = s.time.split(':')
      parseInt(t[0],10)*60+parseInt(t[1],10)

    lectures = lectures.sort (a,b) -> time(a)-time(b)
    no_started = lectures.filter (l) => time(l)>@p.DateService.now()   
 
    if no_started.length==0
      lectures[lectures.length-1]
    else  
      no_started[0]  

  initialize_actives: ->    

    $scope = @p.scope

    @p.Course.get(@p.id).success (course) =>
      $scope.course = course
      $scope.students = course.participants  

    @p.Course.activeLecturesOf(@p.id).success (lectures) =>
      $scope.nolecture = lectures.length==0
      $scope.lecture = @current_of(lectures) if lectures.length>0

    this  

  run: () ->
    $scope = @p.scope

    $scope.register = (student) =>
      @p.Lecture.register(student, $scope.lecture).success (response) =>
        $scope.lecture.participants.push response.data.student 
        @p.Flash.set("#{student.name} registered", $scope)
        $scope.search = ""

    $scope.registered = (student) =>
      student.number in $scope.lecture.participants.map (p) -> p.number 

    $scope.condition = (student) =>
      @p.Matcher.condition(student, $scope.search, $scope.students)  
 
