async = require('async')

models = require('./models')
Course = models.Course
Student = models.Student
Lecture = models.Lecture

class Courses
	index: (req, res) ->
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
	show: (req,res) ->
		Lecture.findById(req.param('id'))
		.populate('course', 'name term')
		.exec (err, lecture) ->
			if err?
				res.json {}
			else
				res.json lecture

	create: (req,res) ->
		data =
			date: req.param('date')
			time: req.param('time')
			place: req.param('place')
			course: req.param('course_id')
		lecture = new Lecture(data)


		
		lecture.save (err) ->
			if err?
				res.json {}
			else
				Course.findById req.param('course_id'), (err, course) =>
					course.lectures.push lecture._id
					course.save (err) ->
						console.log err
				res.json lecture

exports.Lectures = Lectures	

class Registrations
	create:  (req, res) ->
		found = (student, students) ->
			for s in students
				return true if s.toString()==student
			false	

		Lecture.findById req.param('lecture_id'), (err, lecture) ->
			lecture.participants.push req.param('student_id') unless found(req.param('student_id'), lecture.participants)
			lecture.save (err) ->	
				data =
					student: req.param('student_id')
					lecture: lecture._id
				res.json {data}

exports.Registrations = Registrations

class Students
	create: (req,res) ->
		data =
			first_name: req.param('first_name')
			last_name: req.param('last_name')
			name: "#{req.param('last_name')} #{req.param('first_name')}"
			number: req.param('number')
		student = new Student(data)
		Course.findById req.param('course_id'), (err, course) ->
			course.participants.push student._id
			course.save (err) ->
				if err? 
					res.json {}
				else	
					student.save (err) ->
					if err?
						res.json {}
					else
						res.json student


exports.Students = Students
