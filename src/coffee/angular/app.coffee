angular
  .module('registerApp', ['ngRoute','ui.bootstrap','dialogs'])
  .config(['$routeProvider', ($routeProvider) ->
    $routeProvider.when '/courses',
      templateUrl: 'partials/courses.html'
      controller: 'CoursesCtrl'
    $routeProvider.when '/courses/:id',
      templateUrl: 'partials/course.html'
      controller: 'CourseCtrl'
    $routeProvider.when '/courses/:id/register',
      templateUrl: 'partials/lectureRegistration.html'
      controller: 'ActiveLectureCtrl'
    $routeProvider.when '/lectures/:id',
      templateUrl: 'partials/lecture.html'
      controller: 'LectureCtrl'
    $routeProvider.when '/lectures/:id/register',
      templateUrl: 'partials/lectureRegistration.html'
      controller: 'LectureRegistrationCtrl'
    $routeProvider.when '/registration',
      templateUrl: 'partials/registration.html'
      controller: 'RegistrationCtrl'
    $routeProvider.otherwise({redirectTo: '/registration'})
  ])
  . config(['$httpProvider', ($httpProvider) ->
      #$httpProvider.responseInterceptors.push('myInterceptor')
  ])

