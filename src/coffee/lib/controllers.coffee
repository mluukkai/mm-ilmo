models = require('./models')

Course = models.Course
Studet = models.Studet
Lecture = models.Lecture

class Courses
	index: (req, res) ->
		console.log req
		Course.find {}, (err, courses) ->
			if err?
				res.send {}
			else
				res.json courses

	show: (req, res) ->	
		Course.findById(req.param('id'))
		.populate('lectures')
		.populate('participants')
		.exec (err, course) ->
			if err?
				res.json {}
			else
				res.json course

	create: (req,res) ->
		data =
			name: req.param('name')
			term: req.param('term')
			active: req.param('active')
			teachers: [ req.param('teacher') ]
			active: false
		course = new Course(data)
		course.save (err) ->
			if err?
				res.json {}
			else
				res.json course

exports.Courses = Courses

class Lectures

exports.Lectures = Lectures	

