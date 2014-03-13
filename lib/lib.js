(function() {
  var Koe, e, k;

  Koe = (function() {
    function Koe() {}

    Koe.prototype.foo = function() {
      return "foo";
    };

    return Koe;

  })();

  e = "koe";

  console.log(e);

  k = new Koe();

  k.foo();

  exports.Koe = Koe;

  exports.koe = function() {
    return "hello";
  };

}).call(this);
