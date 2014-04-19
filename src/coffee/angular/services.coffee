angular
  .module('registerApp')
  .factory('koe', ->
    {
      test: (koe)->
        console.log koe
    }
  )
  .factory('Lecture', ($http) ->
    {
      all: () ->
        console.log "all"
      get: (id) ->
        $http.get("lectures/#{id}")
    }
  )   
  .factory('Course', ($http) ->
    {
      all: () ->
        $http.get("courses")
      get: (id) ->
        $http.get("courses/#{id}")
      create: (data) ->  
        $http.post('courses', data)
    }
  )
  .factory('Flash', ($timeout) ->
    {
      set: (message, scope) ->
        scope.flashed = true
        scope.flash = message
        $timeout( () ->
          scope.flash = null
          scope.flashed = false
        , 2500) 
    }
  )    