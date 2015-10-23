var app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var clipboard = require('clipboard');
var globalShortcut = require('global-shortcut');
var Discover = require('node-discover');
var NativeImage = require('native-image');
var fs = require('fs');
var yenc = require('yenc');
var dialog = require('dialog');

var icon = NativeImage.createFromPath(__dirname + '/resources/icon.png');
var iconActive = NativeImage.createFromPath(__dirname + '/resources/iconActive.png');

var d = Discover();

var appIcon = null;
var lastReceive = null;

function receiveData(data) {
  appIcon.setImage(iconActive);
  lastReceive = data;
}

d.join("clipboard", receiveData);

function send() {
  var success = d.send("clipboard", { payload : clipboard.readText(), type: 'text' });
}

function sendFiles(paths) {
  var path = paths[0];
  var encoded = yenc.encodeBytes(fs.readFileSync(path));
  var data = { payload: encoded, type: 'file', encoding: 'yenc' };
  receiveData(data);
  var success = d.send("clipboard", data);
}

function receive() {
  if (!lastReceive) {
    return;
  }
  appIcon.setImage(icon);
  if (lastReceive.type === 'text') {
    clipboard.writeText(lastReceive);
  } else {
    dialog.showSaveDialog(function(path){
      if (path) {
        var decoded = yenc.decodeBytes(lastReceive.payload);
        var buffer = new Buffer(decoded);
        fs.writeFileSync(path, buffer);
      }
    });
  }
}

app.on('ready', function(){
  appIcon = new Tray(icon);
  appIcon.setToolTip('Handover');
  appIcon.on('drop-files', function(e, files){
    sendFiles(files);
  });
  globalShortcut.register('CmdOrCtrl+shift+c', send);
  globalShortcut.register('CmdOrCtrl+shift+v', receive);
});

app.on('will-quit', function() {
  globalShortcut.unregisterAll();
});
