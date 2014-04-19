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
      create: (data) ->  
        $http.post('lectures', data)  
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
      registerStudent: (data) ->
        $http.post('students', data)   
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
  .factory('DateService', ->
    {
      getString: ()->
        today = new Date()
        month = "#{today.getMonth()+1}"
        month = "0"+month if (today.getMonth()+1)<10 
        day = "#{today.getDate()}"
        day = "0"+day if (today.getDate()<10)

        "#{today.getYear()+1900}-#{month}-#{day}"
    }
  )