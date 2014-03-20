global.mongoose = require('mongoose')
global.Schema = mongoose.Schema
global.ObjectId = Schema.ObjectId
dburl = process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL || "mongodb://localhost:27017/mydb"
mongoose.connect(dburl)

global.Todo = mongoose.model 'Todo', new Schema
	id: ObjectId
	title:
		type: String
	state:
		type: String
	created_at:
		type: Date
		default: Date.now

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
	registrations: [RegistrationSchema]	
	created_at:
		type: Date
		default: Date.now


#r = new Registration( {name:"koe"} )
#r.save (err) ->
#	console.log err

e = new Event( {name:"luento"} )
#e.save (err) ->
	
Event.findById "5319a5152b7b7800e3a46961", (err, event) ->
	console.log event
	r = new Registration( {name:"jugi"} )
	event.registrations.push r
	console.log event.registrations
	#event.save (err) ->
	#	console.log err

#Registration.find {}, (err, todos) ->
#	console.log todos

io = require('socket.io').listen(5001)

io.sockets.on 'connection', (socket) ->
  socket.emit 'news', { name: 'world' } 
  socket.on 'my other event', (data) ->
  	socket.emit 'news', { name: 'world' } 
  	io.sockets.emit 'news', { name: data } 



