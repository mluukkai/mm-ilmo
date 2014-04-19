angular
  .module('registerApp')
  .controller('RegistrationCtrl', ['$scope', '$location', 'Course', ($scope, $location, Course) ->      
      Course.all().then (course) ->
      	$scope.courses = course.data 

      $scope.clicked = (id) ->
        $location.path("courses/#{id}/register")

    ])  
  .controller('LectureCtrl', ['$scope', '$routeParams', 'Lecture', 'Course', ($scope, $routeParams, Lecture, Course) ->     
      socket = io.connect()
      socket.on 'registration', (data) -> 
        $scope.lecture.participants.push data
        $scope.$apply() 

      Lecture.get($routeParams.id)
      .then( (lecture) ->	
        $scope.lecture = lecture.data
        return $scope.lecture.course._id
      )
      .then( (course_id) -> 
      	Course.get(course_id)
      )
      .then( (course) ->	
        $scope.students = course.data.participants
      )
    ])
    .controller('CoursesCtrl', ['$scope', 'Course', 'Flash', ($scope, Course, Flash) ->
        $scope.new = {}

        Course.all().then (course) ->
      	  $scope.courses = course.data 

        $scope.newCourse = () ->	
          $scope.creationFormVisible = false
          Course.create($scope.new).success (data) ->
            $scope.courses.push data        	
            Flash.set("course #{data.name} #{data.term} created", $scope)
          $scope.new = {}          
    ]) 
    .controller('CourseCtrl', ['$scope','$http','$routeParams', 'Course', 'Lecture', ($scope, $http, $routeParams, Course, Lecture) ->
        Course.get($routeParams.id).success (data) ->
          $scope.course = data

        $scope.createLecture = ->
          $scope.lecture.course_id = $routeParams.id
          Lecture.create($scope.lecture).success (data) ->
            console.log data  
            $scope.course.lectures.push(data)
            $scope.createLectureForm = false 
    
        today = new Date()
        month = "#{today.getMonth()+1}"
        month = "0"+month if (today.getMonth()+1)<10 
        day = "#{today.getDate()}"
        day = "0"+day if (today.getDate()<10)

        $scope.lecture = 
            time: "12:15"
            date: "#{today.getYear()+1900}-#{month}-#{day}"    
    ])     
