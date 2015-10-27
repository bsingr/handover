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
import IconSet from './src/icon_set'
import buildWebApp from './src/build_web_app'
import EventEmitter from 'events'
import TextPayload from './src/text_payload'
import FilePayload from './src/file_payload'
import Client from './src/client'

class Stack extends EventEmitter  {
  push(item) {
    this.last = payload
    this.emit('update')
  }
}

var iconSet = new IconSet()

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
  appIcon.setImage(iconSet.dropIcon(consumer.last.data.payload.mime))
})

var client = new Client(d, consumer)
client.on('fetch', () => {
  appIcon.setImage(iconSet.defaultIcon())
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
  consumer.consume({
    data: data,
    obj: obj
  })
})

app.dock ? app.dock.hide() : false // disable dock icon on OS X

app.on('ready', function(){
  appIcon = new Tray(iconSet.defaultIcon())
  appIcon.setToolTip('Handover')
  appIcon.on('drop-files', function(e, paths){
    publisher.publish(new FilePayload(paths[0]))
  })
  globalShortcut.register('CmdOrCtrl+shift+c', () => {
    publisher.publish(new TextPayload(clipboard.readText()))
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
})
