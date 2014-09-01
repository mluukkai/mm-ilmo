async = require('async')

multiparty = require('multiparty')
xlsx = require('node-xlsx')

models = require('./models')
auth = require('basic-auth')
Course = models.Course
Student = models.Student
Lecture = models.Lecture
User = models.User

class BasicAuth
	perform: (req, res, next) =>
		console.log req.url

		whitelisted = ['/favicon.ico','/courses','/students','/login', '/registrations','/upload']

		return next() if req.url in whitelisted
		return next() if /courses.*active_lecture/.test(req.url)
		return next() if /courses.*participants/.test(req.url)

		credentials = auth(req)

		console.log "kredentials:"
		console.log credentials

		if !credentials
			res.writeHead(401, {
				'WWW-Authenticate': 'Basic realm="example"'
			})
			res.end()

		else
			query =
				user : credentials.name
				password : credentials.pass

			User.find query, (err, user) ->
				if err?
					console.log err
				else
					if user.length==0
						res.writeHead(401, {
							'WWW-Authenticate': 'Basic realm="example"'
						})
						res.end()
					else
						return next()

exports.BasicAuth = BasicAuth

class Auth
	token_valid: (token) ->
		true
		#token?

	login: (req, res) ->
		console.log req.param('username')
		console.log req.param('password')
		token = '1234' if req.param('username') == req.param('password')
		res.send {token:token}
	logout: (req, res) ->
		console.log req.param('auth')
		res.send {}
	perform: (req, res, next) =>
		whitelisted = ['/courses', '/login','/registrations']
		token = req.headers['authorization']
		return next() if req.url in whitelisted or @token_valid(token)
		return next() if /courses.*active_lecture/.test(req.url)
		return next() if /courses.*participants/.test(req.url)
		res.send(401)

exports.Auth = Auth

class Courses
	index: (req, res) ->
		token = req.headers['authorization']
		console.log( 'token '+token)

		Course.find {}, (err, courses) ->
			if err?
				res.send {}
			else
				res.json courses

	participants: (req, res) ->
		Course.findById(req.param('id'))
		.populate('participants')
		.exec (err, course) ->
			if err?
				res.json {}
			else
				res.json course

	show: (req, res) ->
		Course.findById(req.param('id'))
		.populate('lectures')
		.populate('participants')
		.exec (err, course) ->
			if err?
				res.json {}
			else
				res.json course

	delete: (req, res) ->
		Course.findById(req.param('id'))
		.exec (err, course) ->
			if err?
				res.json {}
			else
				course.remove()
				res.json "removed"

	lecture: (req, res) ->
		d = new Date
		n = (val) ->
			return val if val>10
			return "0"+val
		ds = "#{d.getYear()+1900}-#{n(d.getMonth()+1)}-#{n(d.getDate())}"

		Lecture.findOne( { course:req.param('id'), date:ds } )
		.populate('course', 'name term')
		.populate('participants')
		.exec (err, lectures) ->
			if err?
				res.json {}
			else
				res.json lectures

	lectures: (req, res) ->
		token = req.headers['authorization']
		console.log( 'token '+token)

		d = new Date
		n = (val) ->
			return val if val>10
			return "0"+val
		ds = "#{d.getYear()+1900}-#{n(d.getMonth()+1)}-#{n(d.getDate())}"
		console.log ds

		Lecture.find( { course:req.param('id'), date:ds } )
		.populate('course', 'name term')
		.populate('participants')
		.exec (err, lectures) ->
			if err?
				res.json {}
			else
				res.json lectures

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

	delete: (req, res) ->
		Lecture.findById(req.param('id'))
		.exec (err, lecture) ->
			if err?
				res.json {}
			else
				lecture.remove()
				res.json "removed"

	show: (req,res) ->
		Lecture.findById(req.param('id'))
		.populate('course', 'name term')
		.populate('participants', 'name number')
		.exec (err, lecture) ->
			if err?
				res.json {}
			else
				res.json lecture

	edit: (req,res) ->
		data =
			date: req.param('date')
			time: req.param('time')
			place: req.param('place')
			seminar: req.param('seminar')
			course: req.param('course_id')
		if data.seminar
			data.speaker = req.param('speaker')
			data.opponent = req.param('opponent')
			data.chair = req.param('chair')

		Lecture.findById(req.param('id'))
		.populate('course', 'name term')
		.populate('participants', 'name number')
		.exec (err, lecture) ->
			if err?
				res.json {}
			else
				lecture.place = req.param('place') if req.param('place')?
				lecture.time = req.param('time') if req.param('time')?
				lecture.date = req.param('date') if req.param('date')?
				lecture.seminar = req.param('seminar') if req.param('seminar')?
				lecture.speaker = req.param('speaker') if req.param('speaker')?
				lecture.chair = req.param('chair') if req.param('chair')?
				lecture.opponenet = req.param('opponent') if req.param('opponent')?
				lecture.save (err) ->
				if err?
					res.json {}
				else
					res.json lecture

	create: (req,res) ->
		data =
			date: req.param('date')
			time: req.param('time')
			place: req.param('place')
			seminar: req.param('seminar')
			course: req.param('course_id')
		if data.seminar
			data.speaker = req.param('speaker')
			data.opponent = req.param('opponent')
			data.chair = req.param('chair')

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

###
		lecture.save (err) ->
			if err?
				res.json {}
			else
				Course.findById req.param('course_id'), (err, course) =>
					course.lectures.push lecture._id
					course.save (err) ->
						console.log err
				res.json lecture
###

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
				Student.findById req.param('student_id'), (err, student) ->
					data =
						student: student
						lecture: lecture._id
					global.io.sockets.emit 'registration', student
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
		# why on earth the following works? should the stdent be saved 1st?
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
		registerStudent = (student, course) ->
			data =
				first_name: student.first_name
				last_name: student.last_name
				name: "#{student.last_name} #{student.first_name}"
				number: student.number
			new_student = new Student(data)

			new_student.save (err, saved_student) ->
				course.participants.push saved_student
				console.log course.participants
				course.save (err) ->
					console.log "saving #{saved_student.name}"

		among = (student, participants) ->
			student.number in participants.map (p) -> p.number

		registerToCourse = (students, course_id) ->
			Course.findById(course_id)
			.populate('participants')
			.exec (err, course) ->
				for student in students
					if among(student, course.participants)
						console.log "old: #{student.number}"
					else
						console.log "new: #{student.number}"
						registerStudent(student, course)

		isStudent = (s) ->
			nro = s[0].value
			(typeof nro == 'number') and (nro.toString().charAt(0)=='1' )

		extractStudent = (data) ->
			{
				number: data[0].value.toString(),
				last_name: data[2].value,
				first_name: data[3].value.replace("*","")
			}

		extractStudents = (data) ->
			students = []
			for s in data.worksheets[0].data
				students.push extractStudent(s) if isStudent(s)
			console.log students
			students

		student = (data) ->
	  		"#{data[0].value} #{data[2].value} #{data[3].value.replace("*","")}"

		handleExcel = (data) ->
			students = ""
			for s in data.worksheets[0].data
				if isStudent(s)
					students+= student(s) + "\n"
			console.log students
			students

		console.log 'form start'

		form = new multiparty.Form()
		buffer = null
		course_id = null

		form.on('part', (part) ->
			if typeof part.filename != 'undefined'
				buffer = new Buffer(0)
				part.on('data', (chunck) ->
					console.log "chunck of data"
					buffer = Buffer.concat([buffer, chunck])
				)
			else
				if part.name == "course_id"
					part.on('data', (data) ->
						course_id = data.toString();
					)
		)

		form.on('close', () ->
			console.log 'closed excel'
			console.log buffer

			students = handleExcel(xlsx.parse(buffer))
			list = extractStudents xlsx.parse(buffer)
			registerToCourse(list, course_id)
			res.redirect("#courses/#{course_id}");
			#res.writeHead(200, {'content-type': 'text/plain; charset=utf-8'})
			#res.write("course #{course_id}"+ "\n")
			#res.write(students.toString("utf8"))
			#res.end()
		)

		form.parse( req, (err, fields, files) -> )

exports.Students = Students
