/**
* ToDo
* Разаделить index.js по сонтроллерам и отдельно app.js
**/

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
  var handler = null
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
  handler = setHideTimeout(div, holder)
  div.onmouseover = function () {
    clearTimeout(handler)
    handler = null
  }
  div.onmouseout = function () {
    clearTimeout(handler)
    handler = null
    handler = setHideTimeout(div, holder)
  }

  function setHideTimeout (div, holder) {
    return setTimeout(function () {
      div.className += (div.className.length > 0) ? ' fadeout' : 'fadeout'
      setTimeout(function () {
        holder.removeChild(div)
      }, 500)
    }, (cd || 1000))
  }
}

app.paramsToUrl = function (url, params) {
  var str = []
  for (var i in params) {
    str.push(i + '=' + params[i])
  }
  return url + '?' + str.join('&')
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
        setTimeout(function () {
          window.location = '/user/list'
        }, 1000)
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
        self.link = app.paramsToUrl('/api/confirm', {email: result.data.email, uniq: result.data.uniq})
      })
      .error(function () {
        app.Log('error', arguments)
      })
    }
  })
  .controller('UserListControllet', function ($http) {
    var self = this
    self.list = []
    self.getList = function (filter) {
      $http.get('/api/user/list')
        .success(function (result) {
          app.Log('success', result)
          if (result.error) {
            app.Message('error', 'Error', result.data.msg)
            return
          }

          self.list = result.data.list.slice(0)
        })
        .error(function () {
          app.Log('error', arguments)
        })
    }

    self.getList()
  })
  .controller('UserViewController', function ($scope, $http) {
    var self = this
    self.user = {}
    self.getUser = function () {
      if (!self.id) {
        app.Message('error', 'Error', 'No ID')
        return
      }

      $http.get(app.paramsToUrl('/api/user/view', {id: self.id}))
        .success(function (result) {
          if (result.error) {
            app.Message('error', 'Error', result.data.msg)
            return
          }

          self.user = result.data
          self.user.avatar = self.user.avatar || 'http://placehold.it/75x75'
          app.Log(self.user, $scope)
        })
        .error(function () {
          app.Log('error', arguments)
        })
    }
    self.getId = function () {
      return window.location.pathname.split('/').pop()
    }

    self.id = self.getId()
    self.getUser()
  })
  .controller('ConfirmController', function ($http) {
    var self = this
    self.submit = function () {
      if (typeof self.uniq === 'undefined' || typeof self.email === 'undefined') {
        app.Message('error', 'Error', 'no uniq or email')
        return
      }

      $http.get(app.paramsToUrl('/api/confirm/', {email: self.email, uniq: self.uniq}))
      .success(function (result) {
        if (result.error) {
          app.Message('error', 'Error', result.data.msg)
          return
        }

        window.location = '/'
      })
      .error(function () {
        app.Log('error', arguments)
      })
    }
  })
  .controller('DropDBController', function ($http) {
    var self = this
    self.submit = function (){
      $http.post('/api/dropDB', {pwd: self.pwd})
        .success(function (result) {
          if (result.error) {
            app.Message('error', 'Error', result.data.msg)
            return
          }

          app.Message('success', 'Success', result.data.msg)
        })
        .error(function () {
          app.Log('error', arguments)
        })
    }
  })
