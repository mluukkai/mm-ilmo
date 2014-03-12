angular
  .module('registerApp', ['ngRoute'])
  .config(['$routeProvider', ($routeProvider)->
	$routeProvider.when '/courses', 
    	templateUrl: 'partials/courses.html' 
    	controller: 'CoursesCtrl'
    $routeProvider.when '/courses/:id', 
    	templateUrl: 'partials/course.html' 
    	controller: 'CourseCtrl'
    $routeProvider.when '/active', 
    	templateUrl: 'partials/active.html' 
    	controller: 'ActiveEventCtrl'	
    $routeProvider.when '/events',
    	templateUrl: 'partials/events.html' 
    	controller: 'EventsCtrl'
    $routeProvider.when '/events/:id', 
    	templateUrl: 'partials/event.html'
    	controller: 'EventCtrl'  
    $routeProvider.otherwise
    	redirectTo: '/events'
  ])
  .controller('ActiveEventCtrl', ['$scope', '$http', ($scope, $http)->
  		$scope.msg = "msg2";
  		socket = io.connect()

  		$http.get('event').success (data) ->
  			$scope.event = data 

  		$scope.register = ->
  			#socket.emit 'my other event', $scope.name
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
  .controller('CoursesCtrl', ['$scope', '$http',  ($scope, $http) ->
  		$scope.new = 
  			name:"Ohtu"
  			term:"spring 2014"
  			teacher:"mluukkai"

  		$http.get("courses").success (data) ->
  			$scope.courses = data 

  		$scope.newCourse = () ->
  			$http.post('courses', $scope.new).success (data) ->
  				console.log data
  				$scope.courses.push data
  			$scope.new = ""	
  			
    ])
  .controller('CourseCtrl', ['$scope', '$http', '$routeParams',  ($scope, $http, $routeParams) ->

  		$http.get("courses/#{$routeParams.id}").success (data) ->
  			$scope.course = data 
  		
  		$scope.createLecture = ->
  			$scope.lecture.course_id = $routeParams.id
  			console.log $scope.lecture
  			$http.post('lectures', $scope.lecture ).success (data) ->
  				console.log data	
  				$scope.course.lectures.push data

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
