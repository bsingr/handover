var app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var clipboard = require('clipboard');
var globalShortcut = require('global-shortcut');
var Discover = require('node-discover');
var NativeImage = require('native-image');
var fs = require('fs');
var dialog = require('dialog');
var path = require('path');
var mime = require('mime');
var request = require('superagent');

var koa = require('koa');
var http = require('http');

var icon = NativeImage.createFromPath(__dirname + '/resources/icon.png');
var dropIcons = {
  'any': NativeImage.createFromPath(__dirname + '/resources/icon-drop-any.png'),
  'image': NativeImage.createFromPath(__dirname + '/resources/icon-drop-image.png'),
  'text': NativeImage.createFromPath(__dirname + '/resources/icon-drop-text.png')
};

var d = Discover();

var appIcon = null;
var httpPort = null;

var lastReceive = null;
var lastSend = {};

function receiveNotice(data, obj) {
  appIcon.setImage(dropIcons[resolveDropIconName(data)]);
  lastReceive = {
    data: data,
    obj: obj
  };
}

function resolveDropIconName(data) {
  if (data.mime.match(/text/)) {
    return 'text';
  } else if (data.mime.match(/image/)) {
    return 'image';
  } else {
    return 'any';
  }
}

function sendData(data) {
  lastSend = data;
  var success = d.send("clipboard", lastSend);
}

function sendText() {
  sendData({
    payload: clipboard.readText(),
    mime: 'text/plain',
    httpPort: httpPort
  });
}

function sendFiles(paths) {
  var firstPath = paths[0];
  var mimeType = mime.lookup(firstPath);
  sendData({
    mime: mimeType,
    path: firstPath,
    httpPort: httpPort
  });
}

function receive(notice) {
  d.eachNode(function(node){
    if (node.id === notice.obj.iid) {
      request('http://'+node.address+':'+notice.data.httpPort)
        .send()
        .end(function(err, res){
          if (err) {
            console.log('Err', err);
            return;
          }
          appIcon.setImage(icon);
          if (notice.data.mime.match(/text\/plain/)) {
            clipboard.writeText(res.text);
          } else {
            dialog.showSaveDialog({
              title: 'Choose location to store the .' + mime.extension(notice.data.mime) + ' file'
            }, function(destinationPath){
              if (destinationPath) {
                fs.writeFileSync(destinationPath, res.body);
              }
            });
          }
        });
    }
  });
}

d.join("clipboard", receiveNotice);

app.dock ? app.dock.hide() : false; // disable dock icon on OS X

app.on('ready', function(){
  appIcon = new Tray(icon);
  appIcon.setToolTip('Handover');
  appIcon.on('drop-files', function(e, files){
    sendFiles(files);
  });
  globalShortcut.register('CmdOrCtrl+shift+c', sendText);
  globalShortcut.register('CmdOrCtrl+shift+v', function(){
    if (lastReceive) {
      receive(lastReceive);
    }
  });
});

app.on('will-quit', function() {
  globalShortcut.unregisterAll();
});

var webApp = koa();
webApp.use(function *(){
  if (!lastSend) {
    this.status = 404;
    return;
  }
  this.type = lastSend.mime;
  if (lastSend.payload) {
    this.body = lastSend.payload;
  } else if (lastSend.path) {
    this.body = fs.createReadStream(lastSend.path);
  }
  if (lastSend.path && !lastSend.mime.match(/(text|json|xml|gif|png|jpg)/)) {
    this.attachment(path.basename(lastSend.path));
  }
});
var httpServer = http.createServer(webApp.callback());
httpServer.listen(0); // random
httpServer.on('listening', function() {
  httpPort = httpServer.address().port;
  console.log('listening http://127.0.0.1:'+httpPort);
});
