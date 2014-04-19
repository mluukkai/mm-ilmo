angular
  .module('registerApp')
  .factory('koe', ->
    {
      test: (koe)->
        console.log koe
    }
  )  
