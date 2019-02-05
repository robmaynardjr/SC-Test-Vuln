var express = require('express');
var app = express();
var fs = require('fs');
var currentTime = require('node-datetime');

app.all("/", function (req, res){
    var logStats = fs.statSync(__dirname + '/logs/log.txt');
    var logSizeBytes = logStats["size"];
    var logSizeMB = logSizeBytes / 1000000.0;
    var dt = currentTime.create();
    var dtFmt = dt.format('Y-m-d H:M:S');

    app.use(express.static(__dirname + '/public/'));
    res.sendFile(__dirname + '/public/index.html');

    console.log('Visited by ' + req.ip + ' at ' + dtFmt);
    console.log('Current Log Size(MB): ' + logSizeMB);

    fs.appendFile(__dirname + '/logs/log.txt', 'Visited by: ' + req.ip + ' at ' + dtFmt + '\n', function (err) {
        if (err) throw err;
    });
});
3
app.listen(8080);