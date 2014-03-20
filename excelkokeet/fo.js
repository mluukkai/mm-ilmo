var formidable = require('formidable'),
    http = require('http'),
    util = require('util');

http.createServer(function(req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    res.writeHead(200, {'content-type': 'text/plain'});
    var form = new formidable.IncomingForm();
    
    form.on('progress', function(bytesReceived, bytesExpected) {
      console.log('Progress so far: '+(100*(bytesReceived/bytesExpected))+"%");
    });
    
    form.on('field', function(name, value) {
      res.write(name+": "+value+"\n");
    });
    
    form.on('file', function(name, file) {
      res.write("File: ");
      res.write(util.inspect(file));

      console.log(file)

      res.write("\n");
    });

    form.on('error', function(err) {
      console.log('ERROR!');
      res.end();
    });
    
    form.on('aborted', function() {
      console.log('ABORTED!');
      res.end();
    });
    
    form.on('end', function() {
      res.end();
    });

    form.parse(req);

    return;
  }

  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
}).listen(8088);