multiparty = require('multiparty')
http = require('http')
util = require('util')
xlsx = require('node-xlsx')

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

http.createServer( (req, res) ->
  if (req.url == '/upload' && req.method == 'POST') 
    form = new multiparty.Form();
    buffer = null;

    form.on('part', (part) ->
      buffer = new Buffer(0)
      part.on('data', (chunck) ->
         buffer = Buffer.concat([buffer, chunck])
      )
    )

    form.on('close', () ->
      students = handleExcel(xlsx.parse(buffer))
      res.writeHead(200, {'content-type': 'text/plain'})
      res.write(students.toString("utf8"))
      res.end()
    )

    form.parse(req, (err, fields, files) ->
      res.writeHead(200, {'content-type': 'text/plain; charset=utf-8'})
      res.write('received upload:\n\n')
      res.end(util.inspect({fields: fields, files: files}))
    )

  else 
    res.writeHead(200, {'content-type': 'text/html'})
    res.end(
      '<form action="/upload" enctype="multipart/form-data" method="post">'+
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'
    )
).listen(8080)