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

d.join("clipboard", function(msg){
  clipboard.writeText(msg.payload)
});

function send() {
  console.log('x)');
  var success = d.send("clipboard", { payload : clipboard.readText() });
}

function receive() {
  function paste() {
    mainWindow.webContents.send('message', clipboard.readText());
  }

  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      width: 600,
      height: 400,
      frame: false,
      'title-bar-style': 'hidden'
    });
    mainWindow.loadUrl('file://'+__dirname+'/resources/index.html');
    mainWindow.webContents.on('dom-ready', paste);
  } else {
    paste();
  }
}

app.on('ready', function(){
  appIcon = new Tray(__dirname + '/resources/icon.png');
  appIcon.setToolTip('Handover');

  globalShortcut.register('ctrl+shift+c', send);
  globalShortcut.register('ctrl+shift+v', receive);
});

app.on('will-quit', function() {
  // Unregister a shortcut.
  globalShortcut.unregisterAll();
});
