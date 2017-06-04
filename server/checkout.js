var fs = require('fs'),
      path = require('path'),
      unzip = require('unzip');

var filePath = path.join(__dirname,'../src/app','partials.inc');
var zipFile = path.join(__dirname,'../src/app','avam-order-blotter.zip');
var unzippedPath = path.join(__dirname,'../src/app');

if(fs.exists(filePath, function(exists) {
      if(exists) {
            fs.rename(filePath, zipFile);
            fs.createReadStream(zipFile)
                  .pipe(unzip.Extract({ path: unzippedPath }));
      }
}));
