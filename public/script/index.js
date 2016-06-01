var app = {}

app.Silence = false

app.Log = function () {
  if (app.Silence) {
    return
  }
  console.log.apply(console, arguments)
}

app.Message = function (type, title, msg) {
  var div = document.createElement('div')
  var h2 = document.createElement('h2')
  var p = document.createElement('p')
  var body = document.getElementsByTagName('body')[0]
  div.className += type
  div.appendChild(h2)
  div.appendChild(p)
  body.appendChild(div)
  h2.innerHTML = title
  p.innerHTML = msg
  div.className = 'fadeout'
  setTimeout(function () {
    body.removeChild(div)
  }, 1000)
}

angular.module('app', [])
  .controller('SigninController', function ($http) {
    var self = this
    self.submit = function () {
      if (typeof self.email === 'undefined' || typeof self.pwd === 'undefined') {
        app.Message('error', 'Error', 'empty email or pwd')
        return
      }

      if (self.email.trim().length === 0 || self.pwd.trim().length === 0) {
        app.Message('error', 'Error', 'email or pwd not valide')
        return
      }

      app.Log(self.email, self.pwd)

      $http.post('/api/signin', {email: self.email, pwd: self.pwd})
      .success(function () {
        app.Log('success', arguments)
      })
      .error(function () {
        app.Log('error', arguments)
      })
    }
  })
  .controller('SignupController', function ($http) {
    var self = this
    self.submit = function () {
      app.Log(self.email, self.pwd, self.confirm)
      if (typeof self.email === 'undefined' || typeof self.pwd === 'undefined' || typeof self.confirm === 'undefined') {
        app.Message('error', 'Error', 'empty email or pwd or confirm')
        return
      }
      if (self.email.trim().length === 0 || self.pwd.trim().length === 0 || self.confirm.trim().length === 0) {
        app.Message('error', 'Error', 'email or pwd or confirm not valide')
        return
      }

      if (self.pwd !== self.confirm) {
        app.Message('error', 'Error', 'pwd and confirm do not match')
        return
      }

      app.Log(self.email, self.pwd, self.confirm)

      $http.post('/api/signin', {email: self.email, pwd: self.pwd, confirm: self.confirm})
      .success(function () {
        app.Log('success', arguments)
      }).error(function () {
        app.Log('error', arguments)
      })
    }
  })
