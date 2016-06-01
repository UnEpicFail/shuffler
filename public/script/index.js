var app = {}

app.Silence = false;

app.Log = function (){
  if(app.Silence){
    return;
  }
  console.log.apply(console, arguments);
}

app.Message = function(type, title, msg){
  var div = document.createElement('div');
  var h2 = document.createElement('h2');
  var p = document.createElement('p');
  var body = document.getElementsByTagName('body')[0];
  div.className += type;
  h2.innerHtml = title;
  p.innerHtml = msg;
  div.appendChild(h2)
  div.appendChild(p);
  body.appendChild(div);
  console.log(body);
  setTimeout(1000, function(){
    console.log(body, div);
    body.removeChild(div);
  })
}

angular.module('app',[])
  .controller('SigninController', function($http){
    var self = this;
    self.submit = function (){
      if(typeof self.email === 'undefined' || typeof self.pwd === 'undefined'){
        app.Message('error','Error','empty email or pwd');
        return;
      }

      if(self.email.trim().length == 0 || self.pwd.trim().length == 0){
          app.Message('error','Error','email or pwd not valide');
          return;
      }

      app.Log(self.email, self.pwd);

      $http.post('/api/signin',{email:self.email, pwd:self.pwd}).success(function(){
        app.Log('success', arguments);
      }).error(function(){
        app.Log('error', arguments);
      })
    }
  })
  .controller('SignupController', function($http){
    var self = this;
    self.submit = function (){

      if(self.email.trim().length == 0 || self.pwd.trim().length == 0 || self.confirm.trim().length == 0){
        app.Message('error','Error','email or pwd or confirm not valide');
        return;
      }

      if(self.pwd !== self.confirm){
        app.Message('error','Error','pwd and confirm do not match');
        return;
      }

      app.Log(self.email, self.pwd, self.confirm);

      $http.post('/api/signin',{email:self.email, pwd:self.pwd, confirm:self.confirm}).success(function(){
        app.Log('success', arguments);
      }).error(function(){
        app.Log('error', arguments);
      })
    }
  })
