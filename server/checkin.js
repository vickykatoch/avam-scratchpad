var fs = require('fs');
var archiver = require('archiver');
var path = require('path');
var rimraf = require('rimraf');

var input = path.join(__dirname,'../src/app/avam-order-blotter');
var outputPath = path.join(__dirname,'../src/app','partials.zip');
var output = fs.createWriteStream(outputPath);

var archive = archiver('zip', {
    store: true // Sets the compression method to STORE. 
});

archive.on('error', function(err) {
  console.log('Error :', err);
});
output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
  var finalFileName = path.join(__dirname,'../src/app','partials.inc');
  fs.rename(outputPath, finalFileName, function(err) {
      if(err) {
          console.log('error while renaming file');
      } else {
          rimraf(input, function () { 
              console.log('Folder deleted successfully'); 
          });
      }
  });
});
archive.pipe(output);
archive.directory(input);
archive.finalize();
