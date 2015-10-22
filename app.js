var app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var clipboard = require('clipboard');
var BrowserWindow = require('browser-window');
var globalShortcut = require('global-shortcut');
var Discover = require('node-discover');

var d = Discover();

var appIcon = null;
var mainWindow = null;

var lastReceive = null;

d.join("clipboard", function(msg){
  lastReceive = msg.payload;
});

function send() {
  var success = d.send("clipboard", { payload : clipboard.readText() });
}

function receive() {
  clipboard.writeText(lastReceive);
}

app.on('ready', function(){
  appIcon = new Tray(__dirname + '/resources/icon.png');
  appIcon.setToolTip('Handover');

  globalShortcut.register('CmdOrCtrl+shift+c', send);
  globalShortcut.register('CmdOrCtrl+shift+v', receive);
});

app.on('will-quit', function() {
  // Unregister a shortcut.
  globalShortcut.unregisterAll();
});
