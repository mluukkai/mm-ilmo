express = require 'express'
global.app = app = express()
server = require('http').createServer(app)
io = require('socket.io').listen(server)

app.configure ->
	app.use(express.static(__dirname + '/app'))
	app.use(express.json()).use(express.urlencoded())
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

controller = require('./lib/controllers')

app.get '/courses', new controller.Courses().index
app.get '/courses/:id', new controller.Courses().show
app.post '/courses', new controller.Courses().create

app.post '/lectures', new controller.Lectures().create
app.get '/lectures/:id', new controller.Lectures().show

app.post '/registrations', new controller.Registrations().create

app.post '/students', new controller.Students().create	

app.post '/upload', new controller.Students().upload
	

