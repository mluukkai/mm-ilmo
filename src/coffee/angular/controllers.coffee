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
    .controller('ActiveLectureCtrl', ['$scope', '$http', '$routeParams', '$timeout',  ($scope, $http, $routeParams, $timeout) ->     
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
    .controller('CoursesCtrl', ['$scope', 'Course', 'Flash', ($scope, Course, Flash) ->
        $scope.new = {}

        Course.all().then (course) ->
      	  $scope.courses = course.data 

        $scope.newCourse = () ->	
          $scope.creationFormVisible = false
          Course.create($scope.new).success (data) ->
            $scope.courses.push data        	
            Flash.set("course #{data.name} #{data.term} created", $scope)
          $scope.new = {}          
    ]) 
    .controller('CourseCtrl', ['$scope', 'DateString','$routeParams', 'Course', 'Lecture', 'Flash', ($scope, DateString, $routeParams, Course, Lecture, Flash) ->
        $scope.lecture = 
            time: "12:15"
            date: DateString.get()  
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
