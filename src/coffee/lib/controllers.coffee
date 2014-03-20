async = require('async')

multiparty = require('multiparty')
xlsx = require('node-xlsx')

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
	respond: (err, data) ->
			if err?
				res.json {}
			else
				res.json data	

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

		async.parallel(
			[
				(callback) ->
					lecture.save (err) ->
						callback(err, err)	
				,
				(callback) ->
					Course.findById req.param('course_id'), (err, course) ->
						course.lectures.push lecture._id
						course.save (err) ->
							callback(err, err)	
			],
			(err, result) ->
				if err?
					res.json {}
				else	
					res.json lecture
		)

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

	upload: (req, res) ->
		student = (data) ->
			"#{data[0].value} #{data[2].value} #{data[3].value}"

		isStudent = (s) ->
			nro = s[0].value
			(typeof nro == 'number') and (nro.toString().charAt(0)=='1' )

		handleExcel = (data) ->
			students = ""
			for s in data.worksheets[0].data
				if isStudent(s)
					students+= student(s) + "\n" 

		console.log "entered"

		console.log "request started"
		console.log(req.body);
		console.log(req.files);

		id = req.param('course_id') #res.redirect("#/courses/#{id}")

		console.log "entered #{id}"

		form = new multiparty.Form();
		buffer = null;

		console.log "formi"

		form.on('part', (part) ->
			console.log "part"
			buffer = new Buffer(0)
			part.on('data', (chunck) ->
				console.log "chunck"
				buffer = Buffer.concat([buffer, chunck])
			)
		)

		form.on('close', () ->
			console.log "closed"
			students = handleExcel(xlsx.parse(buffer))
			res.writeHead(200, {'content-type': 'text/plain'})
			res.write(students.toString("utf8"))
			res.end()
		)

		form.parse(req, (err, fields, files) ->
		)

		#res.send "uploaded! #{id} #{backURL}"

exports.Students = Students
