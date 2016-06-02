/**
* ToDo
* Разделить app на app, routing, api и healpers
**/

var express = require('express')
var bodyParser = require('body-parser')
var session = require('express-session')
var app = express()
var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID
//var assert = require('assert')
var url = 'mongodb://localhost:27017/shuffler'
var crypto = require('crypto')
var passwordHash = require('password-hash')

app.use('/static', express.static(__dirname + '/public'))
app.use('/libs', express.static(__dirname + '/node_modules'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    maxAge: 60000
  },
  secret: 'Emperor protect'
}))

/****Routing****/

app.get('/', function (req, res) {
  if (hasSession(req, res)) {
    res.sendFile(__dirname + '/public/views/index.html')
  } else {
    res.sendFile(__dirname + '/public/views/singinup.html')
  }
})


app.get('/user/list', function (req, res) {
  if (!hasPermition(req, res, '/user/list/')) {
    res.sendFile(__dirname + '/public/views/support/p500.html')
    return
  }
  res.sendFile(__dirname + '/public/views/user/list.html')
})

app.get('/user/view/*', function (req, res) {
  if (req.params[0].trim().length === 0) {
    res.sendFile(__dirname + '/public/views/support/p404.html')
    return
  }

  if (!hasPermition(req, res, '/user/list/')) {
    res.sendFile(__dirname + '/public/views/support/p500.html')
    return
  }

  res.sendFile(__dirname + '/public/views/user/view.html')
})

/*****POSTS*****/

app.post('/api/signin', function (req, res) {
  console.log('req.params signin', req.body)
  var user = null
  var msg = null
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
          if (passwordHash.verify(req.body.pwd, result[0].password)) {
            if (result[0].status === 2) {
              req.session.save(function (err) {
                if (err) {
                  console.log('err', err)
                  msg = 'Can\'t save sesion!'
                } else {
                  user = {id: result[0]._id}
                }
              })
            } else {
              msg = 'Email is not confirmed!'
            }
          }
        } else {
          console.log('No document(s) found with defined "find" criteria!')
        }
        db.close()
        if (!user) {
          console.log('msg', msg)
          sendNotOkJson({msg: msg || 'Login faled'}, res)
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
      mongoFind(db, 'user', {email: req.body.email}, function (err, result) {
        console.log('result.length', result.length)
        if (err) {
          sendNotOkJson({msg: err}, res)
        } else if (result.length > 0) {
          sendNotOkJson({msg: 'email exist'}, res)
        } else {
          mongoInsert(db, 'user', [
            {
              email: req.body.email,
              password: passwordHash.generate(req.body.pwd),
              statusId: 1, // unconfirmed
              confirmId: randomValueHex(24)
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
      }, {password: 0})
    }
  })
})


/******GETS*****/

app.get('/api/user/list', function (req, res) {
  if (!hasPermition(req, res, '/api/user/list')) {
    sendNotOkJson({msg: 'Has no permisstion to /api/user/list'}, res)
    return
  }

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err)
      sendNotOkJson({msg: 'Get Users faled'}, res)
    } else {
      console.log('Connection established to', url)
      mongoFind(db, 'user', {}, function (err, result) {
        db.close()
        if (err) {
          console.log(err)
          sendNotOkJson({msg: 'Get Users faled'}, res)
          return
        }
        sendOkJson({list: result.slice(0), count: 0}, res)
      }, {password: 0})
    }
  })
})

app.get('/api/user/view', function (req, res) {
  if (!hasPermition(req, res, '/api/user/list')) {
    sendNotOkJson({msg: 'Has no permisstion to /api/user/view'}, res)
    return
  }

  if (!req.query.id) {
    sendNotOkJson({msg: 'No ID'}, res)
    return
  }

  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err)
      sendNotOkJson({msg: 'Get User faled'}, res)
    } else {
      console.log('Connection established to', url)
      mongoFind(db, 'user', {_id: ObjectId(req.query.id)}, function (err, result) {
        db.close()
        if (err) {
          console.log(err)
          sendNotOkJson({msg: 'Get User faled'}, res)
        } else if (result.length > 0) {
          sendOkJson(result[0], res)
        } else {
          sendNotOkJson({msg: 'No User with id ' + req.query.id}, res)
        }
      }, {password: 0})
    }
  })
})

app.get('/api/confirm', function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err)
      sendNotOkJson({msg: err}, res)
    } else {
      console.log('Connection established to', url)
      mongoFind(db, 'user', {email: req.query.email}, function (err, result) {
        if (err) {
          console.log(err)
          sendNotOkJson({msg: err}, res)
        } else if (result.length) {
          console.log(req.query.uniq, result[0].confirmId)
          if (req.query.uniq === result[0].confirmId) {
            sendOkJson(result[0], res)
          } else {
            sendNotOkJson({msg: 'Uniq do no equal'}, res)
          }
        } else {
          console.log('No document(s) found with defined "find" criteria!')
          sendNotOkJson({msg: 'Confirm faled'}, res)
        }
      }, {password: 0})
    }
  })
})

/*****Start*****/

app.listen(3000, function () {
  console.log('I\'m start')
})

/****Helpers****/

function mongoInsert (db, collection_name, data, cb) {
  var collection = db.collection(collection_name)
  collection.insert(data, function (err, result) {
    cb(err, result)
  })
}

function mongoFind (db, collection_name, data, cb, projection) {
  var collection = db.collection(collection_name)
  collection.find(data, (projection || {})).toArray(function (err, result) {
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

function hasPermition (req, res, action) {
  return hasSession(req, res)
}

function hasSession (req, res) {
  return req.session.views
  // if (sess.views) {
  //   sess.views++
  //   console.log(sess.views)
  // } else {
  //   sess.views = 1
  // }
  //return true
}

function randomValueHex (len) {
  return crypto.randomBytes(Math.ceil(len / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, len)   // return required number of characters
}
