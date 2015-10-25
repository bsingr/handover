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
import request from 'superagent'
import http from 'http'
import { icon, dropIcon } from './src/icon'
import { buildWebApp } from './src/web_app'

var d = Discover()

var appIcon = null
var httpPort = null

var lastReceive = null
var lastSend = {}

function receiveNotice(data, obj) {
  appIcon.setImage(dropIcon(data))
  lastReceive = {
    data: data,
    obj: obj
  }
}

function sendData(data) {
  lastSend.data = data
  var success = d.send("clipboard", lastSend.data)
}

function sendText() {
  sendData({
    payload: clipboard.readText(),
    mime: 'text/plain',
    httpPort: httpPort
  })
}

function sendFiles(paths) {
  var firstPath = paths[0]
  var mimeType = mime.lookup(firstPath)
  sendData({
    mime: mimeType,
    path: firstPath,
    httpPort: httpPort
  })
}

function receive(notice) {
  d.eachNode((node) => {
    if (node.id === notice.obj.iid) {
      request('http://'+node.address+':'+notice.data.httpPort)
        .send()
        .end(function(err, res){
          if (err) {
            console.log('Err', err)
            return
          }
          appIcon.setImage(icon)
          if (notice.data.mime.match(/text\/plain/)) {
            clipboard.writeText(res.text)
          } else {
            dialog.showSaveDialog({
              title: 'Choose location to store the .' + mime.extension(notice.data.mime) + ' file'
            }, function(destinationPath){
              if (destinationPath) {
                fs.writeFileSync(destinationPath, res.body)
              }
            })
          }
        })
    }
  })
}

d.join("clipboard", receiveNotice)

app.dock ? app.dock.hide() : false // disable dock icon on OS X

app.on('ready', function(){
  appIcon = new Tray(icon)
  appIcon.setToolTip('Handover')
  appIcon.on('drop-files', function(e, files){
    sendFiles(files)
  })
  globalShortcut.register('CmdOrCtrl+shift+c', sendText)
  globalShortcut.register('CmdOrCtrl+shift+v', function(){
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
