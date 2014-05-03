angular
  .module('registerApp')
  .factory('Auth', ($http) ->
    current_token = 'null'
    {
      token: () -> 
        current_token
      login: (credentials) ->
        $http.post('login', credentials).then(
          (response) ->
            current_token = response.data
            $http.defaults.headers.common.Authorization = current_token.token
            response.data
        )
      logout: () ->
        current_token = null
        $http.delete('logout').then(
          (resp) ->
            $http.defaults.headers.common.Authorization = null  
            #current_token = response.data
            console.log('doo')
        )
    }
  )
  .factory('Lecture', ($http) ->
    {
      all: () ->
        console.log "all"
      get: (id) ->
        $http.get("lectures/#{id}")
      save: (id, data) ->
        $http.put("lectures/#{id}", data)  
      create: (data) ->  
        $http.post('lectures', data)
      register: (student, lecture) ->
        data =
          student_id: student._id
          lecture_id: lecture._id
        $http.post("registrations", data) 
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
      activeLectureOf: (id) ->
        $http.get("courses/#{id}/active_lecture")
      activeLecturesOf: (id) ->
        $http.get("courses/#{id}/active_lectures")        
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
      getString: () ->
        today = new Date()
        month = "#{today.getMonth()+1}"
        month = "0"+month if (today.getMonth()+1)<10 
        day = "#{today.getDate()}"
        day = "0"+day if (today.getDate()<10)

        "#{today.getYear()+1900}-#{month}-#{day}"
      now: () ->
        d = new Date()
        now = ""+ d.getHours()+ ":"+ d.getMinutes()
        t = now.split(':')
        parseInt(t[0],10)*60+parseInt(t[1],10)
    }
  )
  .factory('Matcher', ->
    mathes = (word, students) ->
      count = 0
      for student in students  
        count+=1 if student.name.toUpperCase().indexOf(word) != -1
      count

    {
      condition: (student, search, students) ->
        search = "" if not search?
        search = search.toUpperCase() 
        student_name = student.name.toUpperCase() 
        search.length>1 and student_name.indexOf(search) != -1 and mathes(search, students )<5  
    }
  ).factory('myInterceptor', ($q, $location) ->
    (promise) -> 
      promise.then(
        (response) ->
          #console.log response
          response
        ,  
        (response) -> 
          console.log response
          $q.reject(response)
          #$location.path("registration") 
      )
  )