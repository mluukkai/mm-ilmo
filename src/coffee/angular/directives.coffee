angular
  .module('registerApp')
    .directive('togglable', ()->
      scope: {
        title: '@'
        alternative: '@'
        vis: '=condition'
      }
      restrict: 'AE'
      replace: 'true'
      transclude: true
      templateUrl: 'partials/togglable.html' 
      link: (scope) ->
        nonvis = scope.alternative || scope.title 
        scope.titles = {}
        scope.titles.nonvis = scope.title
        scope.titles.vis = nonvis
    )
    .directive('flash', () ->
      scope: false
      restrict: 'AE'
      replace: 'true'
      template: '<div ng-show="flashed" class="alert alert-success">{{flash}}</div>'
    )