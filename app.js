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
import Icon from './src/icon'
import buildWebApp from './src/build_web_app'
import fetchData from './src/fetch_data'
import EventEmitter from 'events'
import TextPayload from './src/text_payload'
import FilePayload from './src/file_payload'

class Publisher extends EventEmitter  {
  publish(payload) {
    this.last = payload
    this.emit('publish')
  }
}

class Consumer extends EventEmitter {
  consume(payload) {
    this.last = payload
    this.emit('consume')
  }
}

class Paster extends EventEmitter {
  constructor(discover, consumer) {
    super()
    this.discover = discover
    this.consumer = consumer
  }

  findNodeById(id) {
    var node;
    d.eachNode((n) => {
      if (n.id === id) {
        node = n
      }
    })
    return node
  }

  lastNode() {
    var last = this.consumer.last
    if (last) {
      return this.findNodeById(last.obj.iid)
    }
  }

  paste() {
    var that = this
    var notice = this.consumer.last
    var node = this.lastNode()
    if (notice && node) {
      fetchData(node.address, notice.data.httpPort, (dataText, dataBytes) => {
        appIcon.setImage(icon.defaultIcon())
        var mimeType = notice.data.payload.mime
        if (mimeType === 'text/plain') {
          that.emit('pasteText', dataText);
        } else {
          that.emit('pasteFile', mimeType, notice.data.payload.path, dataBytes)
        }
      })
    }
  }
}

var icon = new Icon()

var d = Discover()

var appIcon = null
var httpPort = null

var publisher = new Publisher()
publisher.on('publish', () => {
  var success = d.send('clipboard', {
    httpPort: httpPort,
    payload: publisher.last.serialize()
  })
})

var consumer = new Consumer()
consumer.on('consume', () => {
  appIcon.setImage(icon.dropIcon(consumer.last.data.payload.mime))
})

var paster = new Paster(d, consumer)
paster.on('pasteText', (text) => {
  console.log(text);
  clipboard.writeText(text)
})

paster.on('pasteFile', (mimeType, path, dataBytes) => {
  console.log(mimeType);
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
  appIcon = new Tray(icon.defaultIcon())
  appIcon.setToolTip('Handover')
  appIcon.on('drop-files', function(e, paths){
    publisher.publish(new FilePayload(paths[0]))
  })
  globalShortcut.register('CmdOrCtrl+shift+c', () => {
    publisher.publish(new TextPayload(clipboard.readText()))
  })
  globalShortcut.register('CmdOrCtrl+shift+v', () => {
    paster.paste()
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
