express = require 'express'
app = express()
app.use(express.static(__dirname + '/app'))
port = "4000"
app.listen(process.env.PORT || port);
console.log "Server Started at http://localhost:#{port}"
