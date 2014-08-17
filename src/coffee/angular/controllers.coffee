angular
  .module('registerApp')
  .controller('RegistrationCtrl', ['$http','$dialogs', '$scope', '$location', 'Course', 'Auth',($http, $dialogs, $scope, $location, Course, Auth) ->
      Course.all().then (course) ->
      	$scope.courses = course.data

      $scope.login_dialog = () ->
        dlg = $dialogs.create('partials/logindialog.html', 'LoginModalCtrl',{},{});
        dlg.result.then(
          (cred) ->
            Auth.login(cred)
        ).then(
          (response) ->
            console.log(response)
        )

      $scope.clicked = (id) ->
        $location.path("courses/#{id}/register")

      $scope.loginHidden = () ->
        Auth.token().token?

  ])
  .controller('LoginModalCtrl', ['$scope','$modalInstance','data', ($scope,$modalInstance,data) ->
    $scope.user = {}

    $scope.login = () ->
      $modalInstance.close($scope.user);
    $scope.kansel = () ->
      $modalInstance.dismiss('Canceled')
  ])
  .controller('NavbarCtrl', ['$scope', 'Auth', ($scope, Auth) ->
    $scope.navbarVisible = () ->
      Auth.token().token?

    $scope.logout = () ->
      Auth.logout().then(
        (data) ->
          console.log data
      )
  ])
  .controller('LectureCtrl', ['$scope', '$routeParams', 'Lecture', 'Course','Flash', ($scope, $routeParams, Lecture, Course, Flash) ->
      socket = io.connect()
      socket.on 'registration', (data) ->
        $scope.lecture.participants.push data
        $scope.$apply()

      Lecture.get($routeParams.id)
      .then( (lecture) ->
        $scope.lecture = lecture.data
        $scope.editedLecture = angular.copy($scope.lecture)
        return $scope.lecture.course._id
      )
      .then( (course_id) ->
        Course.get(course_id)
      )
      .then( (course) ->
        $scope.students = course.data.participants
      )

      $scope.saveLecture = () ->
        $scope.lecture = angular.copy($scope.editedLecture)
        Lecture.save($routeParams.id, $scope.lecture).success (data) ->
          $scope.editformVisible = false
          Flash.set("changes saved", $scope)

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
    .controller('ActiveLectureCtrl', ['$scope', '$timeout', '$location', '$route', '$routeParams', 'Course', 'Lecture', 'Flash', 'Matcher', 'DateService', ($scope, $timeout, $location, $route, $routeParams, Course, Lecture, Flash, Matcher, DateService) ->
      p =
          scope: $scope
          id: $routeParams.id
          Lecture: Lecture
          Course: Course
          Flash: Flash
          Matcher: Matcher
          DateService: DateService
          timeout: $timeout
          location: $location
          route: $route
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

        number_of_registrations = (student) ->
          n = 0
          $scope.course.lectures.forEach (lecture) ->
            n+=1 if student._id in lecture.participants
          return n

        $scope.student_number = /0\d{8}$/
        $scope.student = {}
        init_lecture()

        $scope.participated = false

        $scope.show = (item) ->
          return true unless $scope.participated
          return item.present > 0

        Course.get($routeParams.id).success (data) ->
          $scope.course = data
          $scope.course.participants.forEach (participant) ->
            participant.present = number_of_registrations(participant)
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
          return "X" if student._id in lecture.participants
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
        @p.Course.participants_of(lecture.course._id)
    ).then(
      (course) =>
        $scope.students = course.data.participants
        $scope.course = course
    )
    this

  current_of: ( lectures ) =>
    time = ( s ) ->
      t = s.time.split(':')
      parseInt(t[0],10)*60+parseInt(t[1],10)

    lectures = lectures.sort (a,b) -> time(a)-time(b)
    no_started = lectures.filter (l) => time(l)>@p.DateService.now()
    started = lectures.filter (l) => time(l)<=@p.DateService.now()
    started = started.sort (a,b) -> time(b)-time(a)

    next_lecture = started[0] || no_started[0]

    one_after = null
    one_after = no_started[0] if no_started.length>0

    diff = -1
    diff = time(one_after)-@p.DateService.now() if one_after?
    [ next_lecture, diff ]

  initialize_actives: =>
    $scope = @p.scope
    @p.Course.participants_of(@p.id).success (course) =>
      $scope.students = course.participants
      $scope.course = course
    @p.Course.activeLecturesOf(@p.id).then(
      (lectures) =>
        lectures.data
    ).then(
      (lectures) =>
        $scope.nolecture = lectures.length==0
        if lectures.length>0
          [current_lecture, time_diff] = @current_of(lectures)
          $scope.lecture = current_lecture
        time_diff
    ).then(
      (time_diff) =>
        @old_location = @p.location.path()
        if time_diff >= 0
          MINUTE = 60000
          DELTA = 10000
          delay = MINUTE*time_diff+DELTA
          @p.timeout( () =>
            if @old_location==@p.location.path()
              @p.route.reload()
          , delay)
    )

    this

  run: () ->
    $scope = @p.scope

    $scope.student = {}
    $scope.student_number = /0\d{8}$/

    $scope.registerNewStudent = =>
      $scope.student.course_id = $scope.lecture.course._id
      @p.Course.registerStudent($scope.student).then(
        (student) =>
          $scope.students.push student.data
          $scope.registrationFormVisible = false
          student.data
      ).then(
        (student) =>
          @p.Lecture.register(student, $scope.lecture)
      ).then(
        (response) =>
          response.data.data.student
      ).then(
        (student) =>
          $scope.lecture.participants.push student
          @p.Flash.set("#{student.name} added to course and registered", $scope)
          $scope.search = ""
      )
      $scope.student = {}

    $scope.register = (student) =>
      @p.Lecture.register(student, $scope.lecture).success (response) =>
        $scope.lecture.participants.push response.data.student
        @p.Flash.set("#{student.name} registered", $scope)
        $scope.search = ""

    $scope.registered = (student) =>
      student._id in $scope.lecture.participants.map (p) -> p._id

    $scope.condition = (student) =>
      @p.Matcher.condition(student, $scope.search, $scope.students)