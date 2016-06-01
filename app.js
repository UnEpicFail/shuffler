var express = require('express')
var app = express()

app.use('/static', express.static(__dirname + '/public'))
app.use('/libs', express.static(__dirname + '/node_modules'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/views/index.html')
})

app.post('/api/signin', function (req, res) {
  console.log('req.params', req.params)
  res.send('')
})

app.post('/api/signup', function (req, res) {
  console.log('req.params', req.params)
  res.send('')
})

app.listen(3000, function () {
  console.log('I\'m start')
})
