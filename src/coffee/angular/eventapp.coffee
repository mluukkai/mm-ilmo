angular
  .module('eventApp', [])
  .controller('EventCtrl', ['$scope', '$http', ($scope, $http)->
  		socket = io.connect()

  		$http.get('event').success (data) ->
  			$scope.event = data 

  		$scope.register = ->
  			socket.emit 'my other event', $scope.name
  			#$http.post('event', { name: $scope.name}).success (data) ->
  			#	console.log "yes!"
  			$scope.name = ""
  		
  		socket.on 'news', (data) -> 
    		$scope.event.registrations.push data
    		$scope.$apply()	
    ])
