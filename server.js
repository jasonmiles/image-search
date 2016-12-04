var express = require('express')
var Bing = require('node-bing-api')({ accKey: "1ef55e2f96224feebe7aad8c63dd0d58" });
var mongodb = require('mongodb');

var app = express();

var port = process.env.PORT || 8080;


app.get('/api/imagesearch/*', function(req, res) {
  var searchTerm = req.originalUrl.substr(17);
  // var searchTerm = decodeURIComponent(url);

  Bing.images(searchTerm, {
    top: 10,
  }, function(error, result, body){

    if (error) throw error;

    var resultsArr = [];
    for(var i = 0; i < body.value.length; i++) {
      var currentResult = body.value[i];
      resultsArr.push({ url: currentResult.contentUrl,
                        snippet: currentResult.name,
                        thumbnail: currentResult.thumbnailUrl,
                        context: currentResult.hostPageUrl})
    }
    res.send(resultsArr);
  });
})

app.listen(port, function () {
  console.log('Example app listening on port ' + port)
})
