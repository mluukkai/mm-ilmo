# Controllers

angular
  .module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', ($scope)->
    ])
  .controller('MyCtrl2', ['$scope', ($scope)->
    ])

angular
  .module('registerApp')
  .controller('RegistrationCtrl', ['$scope', '$http', '$routeParams', '$location', 'koe',  ($scope, $http, $routeParams, $location, koe) ->      
      $http.get("courses").success (data) ->
        $scope.courses = data 

      $scope.clicked = (id) ->
        $location.path("courses/#{id}/register")

      koe.test('foobar')
    ])  
