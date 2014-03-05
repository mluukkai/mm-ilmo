express = require 'express'
global.app = app = express()
app.configure ->
	app.use(express.static(__dirname + '/app'))
	app.use(express.bodyParser())

port = "4000"
app.listen(process.env.PORT || port);
console.log "Server Started at http://localhost:#{port}"	
