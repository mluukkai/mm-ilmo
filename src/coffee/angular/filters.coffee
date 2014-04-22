angular
  .module('registerApp')
  .filter('date', () ->
    return (date) ->
      return "" if not date?
      parts = date.split("-");
      "#{parts[2]}.#{parts[1]}"
  )   
