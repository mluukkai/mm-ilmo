angular
  .module('registerApp')
  .factory('Lecture', ($http) ->
    {
      all: () ->
        console.log "all"
      get: (id) ->
        $http.get("lectures/#{id}")
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
  .factory('Matcher', ->
    mathes = (word, students) ->
      count = 0
      for student in students  
        count+=1 if student.name.toUpperCase().indexOf(word) != -1
      count

    {
      condition: (student, search, students) ->
        search = search.toUpperCase()
        student_name = student.name.toUpperCase()
        search.length>1 and student_name.indexOf(search) != -1 and mathes(search, students )<5  
    }
  )