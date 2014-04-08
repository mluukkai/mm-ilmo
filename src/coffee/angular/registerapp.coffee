angular
  .module('registerApp', ['ngRoute'])
  .config(['$routeProvider', ($routeProvider)->
	$routeProvider.when '/courses', 
    	templateUrl: 'partials/courses.html' 
    	controller: 'CoursesCtrl'
    $routeProvider.when '/courses/:id', 
    	templateUrl: 'partials/course.html' 
    	controller: 'CourseCtrl'
    $routeProvider.when '/lectures/:id', 
    	templateUrl: 'partials/lecture.html' 
    	controller: 'LectureCtrl'	
    $routeProvider.when '/lectures/:id/register', 
      templateUrl: 'partials/lectureRegistration.html' 
      controller: 'LectureRegistrationCtrl'     
    $routeProvider.when '/active', 
    	templateUrl: 'partials/active.html' 
    	controller: 'ActiveEventCtrl'	
    $routeProvider.when '/events',
    	templateUrl: 'partials/events.html' 
    	controller: 'EventsCtrl'
    $routeProvider.when '/events/:id', 
    	templateUrl: 'partials/event.html'
    	controller: 'EventCtrl'  
    $routeProvider.when '/registration',
      templateUrl: 'partials/registration.html'
      controller: 'RegistrationCtrl'
    $routeProvider.when '/courses/:id/register',
      templateUrl: 'partials/lectureRegistration.html'
      controller: 'ActiveLectureCtrl'
  ])
  .controller('ActiveEventCtrl', ['$scope', '$http', ($scope, $http)->
  		$scope.msg = "msg2";
  		socket = io.connect()

  		$http.get('event').success (data) ->
  			$scope.event = data 

  		$scope.register = ->
  			$http.post('event', { name: $scope.name}).success (data) ->
  				console.log "yes!"
  			$scope.name = ""
  		
  		socket.on 'news', (data) -> 
    		$scope.event.registrations.push data
    		$scope.$apply()	
    ])
  .controller('EventsCtrl', ['$scope', '$http', ($scope, $http)->
    	$scope.msg = "msg";
    	$http.get('events').success (data) ->
    		$scope.events = data
    ])
  .controller('EventCtrl', ['$scope', '$http', '$routeParams',  ($scope, $http, $routeParams) ->
  		$scope.msg = $routeParams.id
  		console.log $routeParams.id

  		$http.get("events/#{$routeParams.id}").success (data) ->
  			$scope.event = data 
  			
    ])
  .controller('CoursesCtrl', ['$scope', '$http', '$timeout', ($scope, $http, $timeout) ->
        ###
        $scope.new = 
          name: 'ohtu'
          term: 'sprinr 2014'
          teacher: 'mluukkai'
        ###
        $http.get("courses").success (data) ->
          $scope.courses = data

        $scope.newCourse = () ->
          console.log $scope.new
          $scope.visible = false
          $http.post('courses', $scope.new).success (data) ->
            console.log data
            $scope.courses.push data
            $scope.flashed = true
            $scope.flash = "course #{data.name} #{data.term} created"
            $timeout( () ->
              $scope.flash = null
              $scope.flashed = false
            , 2500) 
          $scope.new = ""           
    ])   
  .controller('CourseCtrl', ['$scope', '$http', '$routeParams',  ($scope, $http, $routeParams) ->

  		$http.get("courses/#{$routeParams.id}").success (data) ->
  			$scope.course = data 
  		
  		$scope.createLecture = ->
  			$scope.lecture.course_id = $routeParams.id
  			$http.post('lectures', $scope.lecture ).success (data) ->
  				console.log data	
  				$scope.course.lectures.push data

  		$scope.registerStudent = ->
  			$scope.student.course_id = $routeParams.id
  			$http.post('students', $scope.student).success (data) ->
  				console.log data
  				$scope.course.participants.push data
  			$scope.student = {}	

  		$scope.registered = (student, lecture) ->
  			return "  X" if student._id in lecture.participants
  			return ""

  		today = new Date()
  		month = "#{today.getMonth()+1}"
  		month = "0"+month if (today.getMonth()+1)<10 
  		day = "#{today.getDate()}"
  		day = "0"+day if (today.getDate()<10)

  		$scope.lecture = 
  			place: 'exactum'
  			time: "12:15"
  			date: "#{today.getYear()+1900}-#{month}-#{day}"
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
    .controller('RegistrationCtrl', ['$scope', '$http', '$routeParams', '$location',  ($scope, $http, $routeParams, $location) ->      
      $http.get("courses").success (data) ->
        $scope.courses = data 

      $scope.clicked = (id) ->
        $location.path("courses/#{id}/register")

    ]).controller('ActiveLectureCtrl', ['$scope', '$http', '$routeParams', '$timeout',  ($scope, $http, $routeParams, $timeout) ->     
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

    ])
    .filter('date', () ->
    	return (date) ->
    		parts = date.split("-");
    		"#{parts[2]}.#{parts[1]}"
    )