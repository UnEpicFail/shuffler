var app = {}

app.Silence = false

app.Log = function () {
  if (app.Silence) {
    return
  }
  console.log.apply(console, arguments)
}

app.Message = function (type, title, msg, cd) {
  var div = document.createElement('div')
  var h2 = document.createElement('h2')
  var p = document.createElement('p')
  var holder = document.getElementById('messagesHolder')
  if (!holder) {
    holder = document.createElement('div')
    holder.id = 'messagesHolder'
    document.getElementsByTagName('body')[0].appendChild(holder)
  }
  div.className += 'message ' + type
  div.appendChild(h2)
  div.appendChild(p)
  holder.appendChild(div)
  h2.innerHTML = title
  p.innerHTML = msg
  setTimeout(function () {
    div.className += (div.className.length > 0) ? ' fadeout' : 'fadeout'
    setTimeout(function () {
      holder.removeChild(div)
    }, 500)
  }, (cd || 1000))
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
      .success(function (result) {
        app.Log('success', result)
        if (result.error) {
          app.Message('error', 'Error', result.data.msg)
          return
        }

        app.Message('success', 'Success', 'log in success, with id ' + result.data.msg)
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

      $http.post('/api/signup', {email: self.email, pwd: self.pwd, confirm: self.confirm})
      .success(function (result) {
        app.Log(result)
        if (result.error) {
          app.Message('error', 'Error', result.data.msg)
          return
        }

        app.Message('success', 'Success', 'create user, with id ' + result.data.id)
      }).error(function () {
        app.Log('error', arguments)
      })
    }
  })
