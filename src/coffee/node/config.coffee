express = require 'express'
global.app = app = express()
server = require('http').createServer(app)
io = require('socket.io').listen(server)

app.configure ->
	app.use(express.static(__dirname + '/app'))
	app.use(express.bodyParser())
	app.set('views', "#{__dirname}/app/views")
	app.set('view engine', 'ejs')

global.mongoose = require('mongoose')
global.Schema = mongoose.Schema
global.ObjectId = Schema.ObjectId
dburl = process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL || "mongodb://localhost:27017/mydb"
mongoose.connect(dburl)

port = "4000"
console.log "Server Started at http://localhost:#{port}"	
server.listen(process.env.PORT || port);

io.configure () ->
  io.set("transports", ["xhr-polling"]) 
  io.set("polling duration", 20)

io.sockets.on 'connection', (socket) ->
  console.log "new socket registered"
  console.log io.sockets 
  socket.emit 'news', { name: 'joined' } 
  socket.on 'my other event', (data) ->
  	#socket.emit 'news', { name: 'itwasme!' } 
  	io.sockets.emit 'news', { name: data }
  	console.log io.sockets 

global.Todo = mongoose.model 'Todo', new Schema
	id: ObjectId
	title:
		type: String
	state:
		type: String
	created_at:
		type: Date
		default: Date.now


app.get '/mongo', (req,res) ->
	res.send "Mongo word!"

app.get '/mongot/:id', (req,res) ->
	Todo.findById req.param('id'), (err, @todo) =>
		if err?
			res.send "no found #{req.param('id')}"
		else
			res.json @todo

app.delete '/mongot/:id', (req,res) ->
	Todo.findById req.param('id'), (err, @todo) =>
		if err?
			res.send "no found #{req.param('id')}"
		else
			@todo.remove()
			res.json @todo

app.post '/mongot', (req,res) ->

	todo = new Todo({title: req.param('title'), state: req.param('state')})
	todo.save (err) =>
		if err?
			res.json {}
		else
			res.json todo

app.get '/mongot', (req,res) ->
	Todo.find {}, (err, @todos) =>
		if err?
			res.send "bad"
		else
			res.json @todos

RegistrationSchema = new Schema
	id: ObjectId
	name: String
	created_at:
		type: Date
		default: Date.now

global.Registration = mongoose.model 'Registration', RegistrationSchema

global.Event = mongoose.model 'Event', new Schema
	id: ObjectId
	name: String
	test: String
	active: Boolean
	registrations: [RegistrationSchema]	
	created_at:
		type: Date
		default: Date.now

app.get '/reset', (req,res) ->
	Event.update {active:true}, { $set: { active:false} }  , (err) =>
		res.send {}


app.post '/events', (req,res) ->
	event = new Event({name: req.param('name'), active: req.param('active')})
	event.save (err) =>
		if err?
			res.json {}
		else
			res.json event

app.get '/events', (req,res) ->
	Event.find {}, (err, @events) =>
		if err?
			res.send {}
		else
			res.json @events

app.get '/events/:id', (req,res) ->
	Event.findById req.param('id'), (err, @event) =>
		if err?
			res.json {}
		else
			res.json @event

app.get '/event', (req,res) ->
	Event.findOne { active:true }, (err, event) ->
		if err?
			res.send new Event({name:"Luento"})
		else 
			res.send event

app.post '/event', (req,res) ->
	Event.findOne { active:true }, (err, event) ->
		if err?
			event new Event({name:"Luento"})

		console.log event
		r = new Registration( {name:req.param('name')} )
		event.registrations.push r
		io.sockets.emit('news', r)
 
		event.save (err) =>
			if err?
				res.json {}
			else
				res.json event


libbi = require('./lib/lib')
libbi.koe()

k = new libbi.Koe()
console.log k.foo()

CourseSchema = new Schema
	id: ObjectId
	name: String
	term: String
	active: Boolean
	teachers: [String]
	lectures: [
		type: mongoose.Schema.Types.ObjectId
		ref: 'Lecture'
	]
	participants: [
		type: mongoose.Schema.Types.ObjectId
		ref: 'Student'
	]
	created_at:
		type: Date
		default: Date.now

LectureSchema = new Schema
	id: ObjectId
	time: String
	date: String
	place: String
	course:
		type: mongoose.Schema.Types.ObjectId
		ref: 'Course'
	participants: [
		type: mongoose.Schema.Types.ObjectId
		ref: 'Student'
	]	
	created_at:
		type: Date
		default: Date.now

StudentSchema = new Schema
	id: ObjectId
	first_name: String
	last_name: String
	name: String
	number: String
	created_at:
		type: Date
		default: Date.now		

Course = mongoose.model 'Course', CourseSchema	
Lecture = mongoose.model 'Lecture', LectureSchema
Student = mongoose.model 'Student', StudentSchema

#responder = require('./lib/responder')

app.get '/courses', (req,res) ->
	Course.find {}, (err, @courses) =>
		if err?
			res.send {}
		else
			res.json @courses

app.get '/courses/:id', (req,res) ->
	Course.findById(req.param('id'))
	.populate('lectures')
	.populate('participants')
	.exec (err, @course) =>
		if err?
			res.json {}
		else
			res.json @course

app.post '/courses', (req,res) ->
	data =
		name: req.param('name')
		term: req.param('term')
		active: req.param('active')
		teachers: [ req.param('teacher') ]
		active: false
	course = new Course(data)
	course.save (err) =>
		if err?
			res.json {}
		else
			res.json course

app.post '/lectures', (req,res) ->
	data =
		date: req.param('date')
		time: req.param('time')
		place: req.param('place')
		course: req.param('course_id')
	lecture = new Lecture(data)
	lecture.save (err) =>
		if err?
			res.json {}
		else
			Course.findById req.param('course_id'), (err, course) =>
				course.lectures.push lecture._id
				course.save (err) ->
					console.log err
			res.json lecture

app.get '/lectures/:id', (req,res) ->
	Lecture.findById(req.param('id'))
	.populate('course', 'name term')
	.exec (err, lecture) ->
		if err?
			res.json {}
		else
			res.json lecture

app.post '/registrations', (req, res) ->
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

app.post '/students', (req,res) ->
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

