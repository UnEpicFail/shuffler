var express = require('express');
var app = express();

app.use('/static', express.static(__dirname + '/public'));

app.get('*', function (req, res) {
  res.sendFile(__dirname +'/public/views/index.html')
});

app.post('/api/login', function (req, res){
  console.log('req.params', req.params);
  res.send('');
})

app.listen(3000, function () {
  console.log('I\'m start');
});
