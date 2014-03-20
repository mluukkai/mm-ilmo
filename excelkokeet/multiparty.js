var multiparty = require('multiparty')
  , http = require('http')
  , util = require('util')
  , fs = require('fs')
  , xlsx = require('node-xlsx');

http.createServer(function(req, res) {
  if (req.url === '/upload' && req.method === 'POST') {
    // parse a file upload
    var form = new multiparty.Form();

    var sum = 0

    var buffer = null;

    var wstream = null;

    form.on('part', function(part) {
      console.log("---------------------------------");
      console.log(part.headers);
      console.log(part.filename);
      wstream = fs.createWriteStream("trial-"+part.filename);

      wstream.on('finish', function () {
        console.log('file has been written');
      });

      buffer = new Buffer(0);

      part.on('data', function(tsunk) {
         sum += tsunk.length
         console.log(" tsunkki "+ tsunk.length + " total "+sum);
         buffer = Buffer.concat([buffer, tsunk])
      })
      console.log("---------------------------------");
    });

    form.on('close', function() {
      console.log("done total "+sum);
      console.log(buffer.length);
      wstream.write(buffer);
      wstream.end();
      obj = xlsx.parse(buffer)
      console.log(obj)
    });

    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');

      res.end(util.inspect({fields: fields, files: files}));
    });

    return;
  }

  // show a file upload form
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
}).listen(8080);