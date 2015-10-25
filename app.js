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

var icon = new Icon()

var d = Discover()

var appIcon = null
var httpPort = null

var lastReceive = null
var lastSend = {}

function publish(data) {
  lastSend.data = data
  var success = d.send("clipboard", lastSend.data)
}

function receive(notice) {
  d.eachNode((node) => {
    if (node.id === notice.obj.iid) {
      fetchData(node.address, notice.data.httpPort, (dataText, dataBytes) => {
        appIcon.setImage(icon.defaultIcon())
        if (notice.data.mime.match(/text\/plain/)) {
          clipboard.writeText(dataText)
        } else {
          dialog.showSaveDialog({
            title: 'Choose location to store the .' + mime.extension(notice.data.mime) + ' file'
          }, function(destinationPath){
            if (destinationPath) {
              fs.writeFileSync(destinationPath, dataBytes)
            }
          })
        }
      })
    }
  })
}

d.join("clipboard", function(data, obj){
  appIcon.setImage(icon.dropIcon(data))
  lastReceive = {
    data: data,
    obj: obj
  }
})

app.dock ? app.dock.hide() : false // disable dock icon on OS X

app.on('ready', function(){
  appIcon = new Tray(icon.defaultIcon())
  appIcon.setToolTip('Handover')
  appIcon.on('drop-files', function(e, paths){
    var firstPath = paths[0]
    var mimeType = mime.lookup(firstPath)
    publish({
      mime: mimeType,
      path: firstPath,
      httpPort: httpPort
    })
  })
  globalShortcut.register('CmdOrCtrl+shift+c', () => {
    publish({
      payload: clipboard.readText(),
      mime: 'text/plain',
      httpPort: httpPort
    })
  })
  globalShortcut.register('CmdOrCtrl+shift+v', () => {
    if (lastReceive) {
      receive(lastReceive)
    }
  })
})

app.on('will-quit', function() {
  globalShortcut.unregisterAll()
})

var httpServer = http.createServer(buildWebApp(lastSend).callback())
httpServer.listen(0) // random
httpServer.on('listening', function() {
  httpPort = httpServer.address().port
  console.log('listening http://127.0.0.1:'+httpPort)
})
