angular
  .module('registerApp')
  .factory('Auth', ($http) ->
    current_token = {}
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
        current_token = {}
        $http.delete('logout').then(
          (resp) ->
            $http.defaults.headers.common.Authorization = null
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
      participants_of: (id) ->
        $http.get("courses/#{id}/participants")
      create: (data) ->
        $http.post('courses', data)
      activeLectureOf: (id) ->
        $http.get("courses/#{id}/active_lecture")
      activeLecturesOf: (id) ->
        $http.get("courses/#{id}/active_lectures")
      registerStudent: (data) ->
        $http.post('students', data)
      toggleActivity: (id) ->
        $http.post("courses/#{id}/activity")        
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

    part_matches = (part, name) ->
      name_parts = name.split(' ')
      match = false
      name_parts.forEach (name_part) ->
        if name_part.indexOf(part) != -1
          match = true
      match

    match = (search, name, students) ->
      search_parts = search.split(' ')
      n = 0
      search_parts.forEach (part) ->
        n += 1 if part_matches(part, name)
      n >= search_parts.length

    match_count = (search, students) ->
      n = 0
      students.forEach (student) ->
        student_name = student.name.toUpperCase().replace /-/, " "
        n += 1 if match(search, student_name, students)
      n

    {
      condition: (student, search, students) ->
        search = "" if not search?
        search = search.toUpperCase().replace /-/, " "
        student_name = student.name.toUpperCase().replace /-/, " "
        search.length>1 and match(search, student_name, students) and match_count(search, students)<4
    }
  ).factory('myInterceptor', ($q, $location, $rootScope, $timeout) ->
    (promise) ->
      promise.then(
        (response) ->
          response
        ,
        (response) ->
          $rootScope.authFlash = "Please log to enter the page!"
          $rootScope.authFlashed = true
          $timeout( () ->
            $rootScope.authFlashed = false
          ,10000)

          $location.path("registration")
      )
  )