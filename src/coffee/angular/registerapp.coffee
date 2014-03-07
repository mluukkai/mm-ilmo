angular
  .module('registerApp', [])
  .config(['$routeProvider', ($routeProvider)->
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

