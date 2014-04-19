angular
  .module('registerApp')
    .directive('togglable', ()->
      scope: {
        title: '@'
        vis: '=condition'
      }
      restrict: 'AE'
      replace: 'true'
      transclude: true
      template: '<div><h3 ng-init="vis=false" ng-click="vis=!vis">{{title}}</h3><div ng-show="vis"><span ng-transclude></span></div></div>'
    )
    .directive('flash', () ->
      scope: false
      restrict: 'AE'
      replace: 'true'
      template: '<div ng-show="flashed" class="alert alert-success">{{flash}}</div>'
    )