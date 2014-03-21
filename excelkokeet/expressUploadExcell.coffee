express = require 'express'
multiparty = require('multiparty')
http = require('http')
util = require('util')
xlsx = require('node-xlsx')

app = express()
server = http.createServer(app)

app.configure ->
  app.use(express.static(__dirname + '/'))
  app.use(express.json()).use(express.urlencoded())

port = "4004"
console.log "Server Started at http://localhost:#{port}"  
server.listen(process.env.PORT || port);

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

  console.log students 
  students

app.post '/upload',  (req, res) ->
  form = new multiparty.Form();
  buffer = null;

  console.log "request started"

  form.on('part', (part) ->
    console.log "event fired"

    if typeof part.filename != 'undefined'
      buffer = new Buffer(0)
      part.on('data', (chunck) ->
        console.log "chunck of data"
        buffer = Buffer.concat([buffer, chunck])
      )
    else
      if part.name == "course_id"
        part.on('data', (data) ->
          console.log "*************"
          console.log "course_id #{data.toString()}"
          console.log "*************"
      )
  )

  form.on('close', () ->
    students = handleExcel(xlsx.parse(buffer))
    res.writeHead(200, {'content-type': 'text/plain; charset=utf-8'})
    res.write(students.toString("utf8"))
    res.end()
  )

  form.parse(req, (err, fields, files) ->
  )

app.get '/',  (req, res) ->
  res.writeHead(200, {'content-type': 'text/html'})
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="hidden" name="course_id" value="55"><br>'+
    '<input id="file" type="file" name="upload" multiple="multiple"><br>'+
    '<input onclick="javascript:$(this).parent().submit();" type="submit" value="Upload">'+
    '</form>'
  )
