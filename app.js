var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var url = 'mongodb://localhost:27017/shuffler'

app.use('/static', express.static(__dirname + '/public'))
app.use('/libs', express.static(__dirname + '/node_modules'))
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/views/index.html')
})

app.post('/api/signin', function (req, res) {
  console.log('req.params signin', req.body)
  var user = 1
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err)
      sendNotOkJson({msg: 'Login faled'}, res)
    } else {
      console.log('Connection established to', url)
      mongoFind(db, 'user', {email: req.body.email}, function (err, result) {
        if (err) {
          console.log(err)
        } else if (result.length) {
          if (result[0].password === req.body.pwd) {
            user = {id: result[0]._id}
          }
        } else {
          console.log('No document(s) found with defined "find" criteria!')
        }
        db.close()
        if (!user) {
          sendNotOkJson({msg: 'Login faled'}, res)
          return
        }
        sendOkJson(user, res)
      })
    }
  })
})

app.post('/api/signup', function (req, res) {
  console.log('req.params signup', req.body)
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err)
      sendNotOkJson({msg: err}, res)
    } else {
      console.log('Connection established to', url)
      mongoInsert(db, 'user', [
        {
          email: req.body.email,
          password: req.body.pwd
        }
      ], function (err, result) {
        if (err) {
          sendNotOkJson({msg: err}, res)
        } else {
          console.log(result)
          sendOkJson({id: result.insertedIds}, res)
        }
        db.close()
      })
    }
  })
})

app.listen(3000, function () {
  console.log('I\'m start')
})

function mongoInsert (db, collection_name, data, cb) {
  var collection = db.collection(collection_name)
  collection.insert(data, function (err, result) {
    cb(err, result)
  })
}

function mongoFind (db, collection_name, data, cb) {
  var collection = db.collection(collection_name)
  collection.find(data).toArray(function (err, result) {
    cb(err, result)
  })
}

function sendOkJson (data, res) {
  res.send(JSON.stringify({
    data: data,
    success: true,
    error: false
  }))
}

function sendNotOkJson (data, res) {
  res.send(JSON.stringify({
    data: data,
    success: false,
    error: true
  }))
}
