var app = require('app');
var BrowserWindow = require('browser-window');
var menubar = require('menubar');
var dialog = require('dialog');

var mkdirp = require('mkdirp')
var request = require('request-promise');
var LocalStorage = require('node-localstorage').LocalStorage;

var lsDir = app.getPath('appData')+'/GyazoMenubar/localStorage';

var client = require('./client_keys.js');

mkdirp.sync(lsDir)
localStorage = new LocalStorage(lsDir);

var token = '';


var mb = menubar({
  icon: './icon.png'
})


mb.on('after-create-window', function(){
  if(localStorage.getItem('oauthToken')){
    token = localStorage.getItem('oauthToken');
    var loadPath = 'file://'+ __dirname+'/static/list.html?token='+token;
    mb.window.loadUrl(loadPath);
    mb.window.setVisibleOnAllWorkspaces(true)
  }else{
    mb.window.hide()
    var win = new BrowserWindow({ width: 800, height: 600 });
    win.webContents.on('will-navigate', function(event, url){
      console.log(url)
      if(/^https?:\/\/pastak.github.io\/gyazo-menubar\//.test(url)){
        var _code = url.split('?code=')[1];

        request({
          //XXX: On document, url host is api.gyazo.com but has redirect problem so use gyazo.com
          uri: 'https://gyazo.com/oauth/token',
          method: 'POST',
          followRedirect: true,
          followAllRedirects: true,
          formData: {
            client_id: client.clientId,
            client_secret: client.clientSecret,
            redirect_uri: 'http://pastak.github.io/gyazo-menubar/',
            code: _code,
            grant_type: 'authorization_code'
          }
        }).then(function(response){
          var _token = JSON.parse(response).access_token;
          localStorage.setItem('oauthToken', _token)
          dialog.showMessageBox({
            type: 'info',
            buttons: ['ok'],
            message: 'You successed get OAuth Token! Please reopen.'
          })
          win.close();
        }).catch(console.dir)
      }
    })
    win.loadUrl('https://api.gyazo.com/oauth/authorize?client_id='+client.clientId+'&redirect_uri=http://pastak.github.io/gyazo-menubar/&response_type=code')
  }
})

mb.on('hide', function(){
  mb.window.reload()
})
