(function(){
  var url = require('url')
  var Gyazo  = require('gyazo-api');
  var clipboard = require('clipboard');
  var NativeImage = require('native-image');
  var remote = require('remote');
  var Menu = remote.require('menu');
  var MenuItem = remote.require('menu-item');

  function notification(text){
    var notificationElm = document.getElementsByClassName('notification')[0];
    notificationElm.textContent = text;
    notificationElm.style.display = 'block';
    window.setTimeout(function(){
      document.getElementsByClassName('notification')[0].textContent = '';
      notificationElm.style.display = 'none';
    }, 1500)
  }

  var itemList = document.getElementsByClassName('item-list')[0];
  itemList.innerHTML = '';

  var token = url.parse(location.href, true).query.token
  var client = new Gyazo(token);
  client.list({page: 1, per_page: 25})
    .then(function(res){
      res.data.filter(function(item){ return !!item.permalink_url }).forEach(function(item){
        var itemElement = document.createElement('a');
        var imgElement = document.createElement('img');
        imgElement.src = item.url;
        itemElement.addEventListener('contextmenu', function(e){
          var menu = new Menu();
          menu.append(new MenuItem({
            label: 'Copy HTML Text',
            click: function(){
              var _t = "<a href='"+ item.permalink_url +"'><img src='"+ item.url +"'></a>"
              clipboard.writeText(_t,'HTML');
              notification('copied');
            }
          }));
          menu.append(new MenuItem({
            label: 'Copy Markdown',
            click: function(){
              var _t = "[![Gyazo](" + item.url + ")](" + item.permalink_url + ")";
              clipboard.writeText(_t,'HTML');
              notification('copied');
            }
          }));
          menu.append(new MenuItem({
            label: 'Copy URL Text',
            click: function(){
              clipboard.writeText(item.permalink_url);
              notification('copied');
            }
          }));
          menu.append(new MenuItem({
            label: 'Copy Image',
            click: function() {
              var _c = document.createElement('canvas');
              _c.width = imgElement.naturalWidth;
              _c.height = imgElement.naturalHeight;
              var _ctx = _c.getContext('2d');
              _ctx.drawImage(imgElement, 0, 0);
              clipboard.writeImage(NativeImage.createFromDataUrl(_c.toDataURL()));
              notification('copied');
            }
          }));
          e.preventDefault();
          menu.popup(remote.getCurrentWindow());
        })
        itemElement.addEventListener('dblclick', function(){
          var _c = document.createElement('canvas');
          _c.width = imgElement.naturalWidth;
          _c.height = imgElement.naturalHeight;
          var _ctx = _c.getContext('2d');
          _ctx.drawImage(imgElement, 0, 0);
          clipboard.writeImage(NativeImage.createFromDataUrl(_c.toDataURL()));
          clipboard.writeText(item.permalink_url);
          notification('copied');
        })
        itemElement.appendChild(imgElement);
        itemList.appendChild(itemElement)
      })
    })
})()
