var AWS = require('aws-sdk'); 
var fs = require('fs');

exports.processFile = function ( req, res, file, dpath, cb ) {
  console.log("processing file");
  if(!file.size) {
    return cb("emptyfile","nofile" );
  }
  var s3 = new AWS.S3(res.locals._admin.config.aws); 
  var upload_bucket = res.locals._admin.config.aws.bucket;
  //where in the columns context are we?
  
  // fieldName: 'view[image][records][0][columns][folder]
  var columnPaths = /view\[(.*)\]\[records\]\[(.*)\]\[columns\]\[(.*)\]/g.exec(file.fieldName);
  var tableName = columnPaths[1];
  var recordIndex = columnPaths[2];
  var columnName = columnPaths[3];
  
  var settings = res.locals._admin.settings;
  //console.log(settings);
  
  //req.files.view.image.records
  //[ { columns: { name: [Object], folder: [Object] } } ]
  var record = req.body.view[tableName].records[recordIndex];
  
  //console.log( record );
  
  var desiredPathName = record.columns[columnName];

  /*
  [ { insert: 'true',
    columns:
     { original_filename: '',
       mime_type: '',
       alt_text: '',
       date: '',
       folder: '',
       name: 'test' } } ]
    /
  */
 
  openFileBuffer(file.path, function (error, buffer) {

    if(error){
      return cb(error, "s3error");
    }

    s3.putObject( {
      "Bucket":upload_bucket,
      "Body":buffer,
      "ACL":"public-read",
      "ContentType":file.type,
      "Key":desiredPathName
      
      }, function(err, data) {
        if(err) { console.log(err); }
        return cb(err, desiredPathName);    
      }
    );
  });
  
}

function openFileBuffer( fileName, cb ) {  
  fs.readFile( fileName, function( err, data ) {
    if(err){
      return cb(err);
    }
    return cb(null, new Buffer(data, 'binary'));
  });
}

