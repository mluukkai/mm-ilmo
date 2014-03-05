express = require 'express'
global.app = app = express()
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
app.listen(process.env.PORT || port);
console.log "Server Started at http://localhost:#{port}"	

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

