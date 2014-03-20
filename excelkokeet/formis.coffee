formidable = require('formidable')
http = require('http')
util = require('util')

http.createServer( (req, res) ->
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') 
    form = new formidable.IncomingForm()

    form.parse(req, (err, fields, files) ->
      res.writeHead(200, {'content-type': 'text/plain'})
      res.write('received upload:\n\n')

      console.log files
      console.log fields

      res.end(util.inspect({fields: fields, files: files}))
    )

    return

  res.writeHead(200, {'content-type': 'text/html'})
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  )
).listen(8080)