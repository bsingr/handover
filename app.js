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
var path = require('path');
var mime = require('mime');

var icon = NativeImage.createFromPath(__dirname + '/resources/icon.png');
var dropIcons = {
  'any': NativeImage.createFromPath(__dirname + '/resources/icon-drop-any.png'),
  'image': NativeImage.createFromPath(__dirname + '/resources/icon-drop-image.png'),
  'text': NativeImage.createFromPath(__dirname + '/resources/icon-drop-text.png')
};

var d = Discover();

var appIcon = null;
var lastReceive = null;

function receiveData(data) {
  appIcon.setImage(dropIcons[resolveDropIconName(data)]);
  lastReceive = data;
}

function resolveDropIconName(data) {
  if (data.type === 'text') {
    return 'text';
  } else if (data.mime.match(/image/)) {
    return 'image';
  } else {
    return 'any';
  }
}

function send() {
  var success = d.send("clipboard", { payload : clipboard.readText(), type: 'text' });
}

function sendFiles(paths) {
  var path = paths[0];
  var mimeType = mime.lookup(path);
  var encoded = yenc.encodeBytes(fs.readFileSync(path));
  var data = { payload: encoded, type: 'file', encoding: 'yenc', mime: mimeType };
  var success = d.send("clipboard", data);
}

function receive(data) {
  appIcon.setImage(icon);
  if (data.type === 'text') {
    clipboard.writeText(data);
  } else {
    dialog.showSaveDialog({
      title: 'Choose location to store the .' + mime.extension(data.mime) + ' file'
    }, function(path){
      if (path) {
        var decoded = yenc.decodeBytes(data.payload);
        var buffer = new Buffer(decoded);
        fs.writeFileSync(path, buffer);
      }
    });
  }
}

d.join("clipboard", receiveData);

app.dock.hide();
app.on('ready', function(){
  appIcon = new Tray(icon);
  appIcon.setToolTip('Handover');
  appIcon.on('drop-files', function(e, files){
    sendFiles(files);
  });
  globalShortcut.register('CmdOrCtrl+shift+c', send);
  globalShortcut.register('CmdOrCtrl+shift+v', function(){
    if (lastReceive) {
      receive(lastReceive);
    }
  });
});

app.on('will-quit', function() {
  globalShortcut.unregisterAll();
});
