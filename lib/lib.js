(function() {
  var Koe, e;

  Koe = (function() {
    function Koe() {}

    return Koe;

  })();

  e = "koe";

  console.log(e);

  exports.koe = function() {
    return "hello";
  };

}).call(this);
