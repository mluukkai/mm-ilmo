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
      all: ()->
        console.log "all"
      get: (id)->
        $http.get("lectures/#{id}")
    }
  )   
  .factory('Course', ($http) ->
    {
      all: ()->
        $http.get("courses")
      get: (id)->
        $http.get("courses/#{id}")
    }
  ) 