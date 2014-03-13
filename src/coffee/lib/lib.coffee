class Koe
	foo: ->
		"foo"

e = "koe"
console.log e

k = new Koe()
k.foo()

exports.Koe = Koe

exports.koe = ->
	"hello"

