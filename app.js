'use babel'

import app from 'app'
import Menu from 'menu'
import Tray from 'tray'
import clipboard from 'clipboard'
import globalShortcut from 'global-shortcut'
import Discover from 'node-discover'
import fs from 'fs'
import dialog from 'dialog'
import path from 'path'
import mime from 'mime'
import http from 'http'
import IconResolver from './src/icon_resolver'
import buildWebApp from './src/build_web_app'
import EventEmitter from 'events'
import TextPayload from './src/text_payload'
import FilePayload from './src/file_payload'
import Client from './src/client'
import NativeImage from 'native-image'

class Stack extends EventEmitter  {
  push(item) {
    this.last = item
    this.emit('update')
  }
}

var iconSet = {
  'ready': NativeImage.createFromPath(__dirname + '/resources/icon.png'),
  'dropAny': NativeImage.createFromPath(__dirname + '/resources/icon-drop-any.png'),
  'dropImage': NativeImage.createFromPath(__dirname + '/resources/icon-drop-image.png'),
  'dropText': NativeImage.createFromPath(__dirname + '/resources/icon-drop-text.png')
}
var iconResolver = new IconResolver()

var d = Discover()

var appIcon = null
var httpPort = null

var publisher = new Stack()
publisher.on('update', () => {
  var success = d.send('clipboard', {
    httpPort: httpPort,
    payload: publisher.last.serialize()
  })
})

var consumer = new Stack()
consumer.on('update', () => {
  var iconName = iconResolver.dropIconName(consumer.last.data.payload.mime)
  appIcon.setImage(iconSet[iconName])
})

var client = new Client(d, consumer)
client.on('fetch', () => {
  appIcon.setImage(iconSet.ready)
})
client.on('fetchText', (text) => {
  clipboard.writeText(text)
})
client.on('fetchFile', (mimeType, path, dataBytes) => {
  dialog.showSaveDialog({
    title: 'Choose location to store the .' + mime.extension(mimeType) + ' file'
  }, function(destinationPath){
    if (destinationPath) {
      fs.writeFileSync(destinationPath, dataBytes)
    }
  })
})

d.join("clipboard", function(data, obj){
  consumer.push({
    data: data,
    obj: obj
  })
})

function buildClientUrl(host, port) {
  return 'http://'+host+':'+port
}

var mdns = require('mdns-js');
//if you have another mdns daemon running, like avahi or bonjour, uncomment following line
//mdns.excludeInterface('0.0.0.0');

var browser = mdns.createBrowser(mdns.tcp('handover'));
browser.on('ready', function () {
  browser.discover();
});

browser.on('update', function (data) {
  if (!httpPort || !data.port) {
    return
  }
  if (data.port === httpPort) {
    var myAddresses = buildAddresses()
    for (let idx in myAddresses) {
      let myAddress = myAddresses[idx]
      if (data.addresses.indexOf(myAddress) > -1) {
        return
      }
    }
  }
  var clientUrl = buildClientUrl(data.addresses[0], data.port);
  console.log(clientUrl, 'detected', data)
});

import os from 'os'

function buildAddresses() {
  var addresses = []
  var nics = os.networkInterfaces()
  for (let key of Object.keys(nics)) {
    let nic = nics[key]
    for (let idx in nic) {
      let nicAddress = nic[idx]
      if (!nicAddress.internal) {
        addresses.push(nicAddress.address)
      }
    }
  }
  return addresses
}

app.dock ? app.dock.hide() : false // disable dock icon on OS X

app.on('ready', function(){
  appIcon = new Tray(iconSet.ready)
  appIcon.setToolTip('Handover')
  appIcon.on('drop-files', function(e, paths){
    publisher.push(new FilePayload(paths[0]))
  })
  globalShortcut.register('CmdOrCtrl+shift+c', () => {
    publisher.push(new TextPayload(clipboard.readText()))
  })
  globalShortcut.register('CmdOrCtrl+shift+v', () => {
    client.fetch()
  })
})

app.on('will-quit', function() {
  globalShortcut.unregisterAll()
})

var httpServer = http.createServer(buildWebApp(publisher).callback())
httpServer.listen(0) // random
httpServer.on('listening', function() {
  httpPort = httpServer.address().port
  console.log('listening http://127.0.0.1:'+httpPort)
  var addresses = buildAddresses()
  for (let idx in addresses) {
    let address = addresses[idx]
    var service = mdns.createAdvertisement(mdns.tcp('handover'), httpPort, {
      name: 'handover',
      host: address
    });
    service.start();
  }
})
