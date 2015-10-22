var app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var clipboard = require('clipboard');
var BrowserWindow = require('browser-window');
var globalShortcut = require('global-shortcut');
var Discover = require('node-discover');
var NativeImage = require('native-image');

var icon = NativeImage.createFromPath(__dirname + '/resources/icon.png');
var iconActive = NativeImage.createFromPath(__dirname + '/resources/iconActive.png');

var d = Discover();

var appIcon = null;
var lastReceive = null;

d.join("clipboard", function(msg){
  appIcon.setImage(iconActive);
  lastReceive = msg.payload;
});

function send() {
  var success = d.send("clipboard", { payload : clipboard.readText() });
}

function receive() {
  clipboard.writeText(lastReceive);
  appIcon.setImage(icon);
}

app.on('ready', function(){
  appIcon = new Tray(icon);
  appIcon.setToolTip('Handover');
  globalShortcut.register('CmdOrCtrl+shift+c', send);
  globalShortcut.register('CmdOrCtrl+shift+v', receive);
});

app.on('will-quit', function() {
  globalShortcut.unregisterAll();
});
