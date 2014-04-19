angular
  .module('registerApp')
    .directive('togglable', ()->
      scope: {
        title: '@'
      }
      restrict: 'AE'
      replace: 'true'
      transclude: true
      template: '<div><h3 ng-init="vis=false" ng-click="vis=!vis">{{title}}</h3><div ng-show="vis"><span ng-transclude></span></div></div>'
    )