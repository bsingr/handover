'use babel'

import {app, Menu, Tray, globalShortcut, dialog, clipboard, nativeImage} from 'electron'
import fs from 'fs'
import mime from 'mime'
import http from 'http'
import IconResolver from './src/icon_resolver'
import buildWebApp from './src/build_web_app'
import TextPayload from './src/text_payload'
import FilePayload from './src/file_payload'
import Client from './src/client'
import Stack from './src/stack'
import Discovery from './src/discovery'

const iconSet = {
  'ready': nativeImage.createFromPath(__dirname + '/resources/icon.png'),
  'dropAny': nativeImage.createFromPath(__dirname + '/resources/icon-drop-any.png'),
  'dropImage': nativeImage.createFromPath(__dirname + '/resources/icon-drop-image.png'),
  'dropText': nativeImage.createFromPath(__dirname + '/resources/icon-drop-text.png')
}

let appIcon = null
let httpPort = null

const consumer = new Stack()
consumer.on('update', () => {
  const iconResolver = new IconResolver()
  const iconName = iconResolver.dropIconName(consumer.last.data.payload.mime)
  appIcon.setImage(iconSet[iconName])
})

const discovery = new Discovery()
discovery.on('receive', notice => consumer.push(notice))

const publisher = new Stack()
publisher.on('update', () => {
  discovery.send({
    httpPort: httpPort,
    payload: publisher.last.serialize()
  })
})

const client = new Client()
client.on('fetch', () => appIcon.setImage(iconSet.ready))
client.on('fetchText', text => clipboard.writeText(text))
client.on('fetchFile', (mimeType, path, dataBytes) => {
  dialog.showSaveDialog({
    title: 'Choose location to store the .' + mime.getExtension(mimeType) + ' file'
  }, destinationPath => {
    if (destinationPath) {
      fs.writeFileSync(destinationPath, dataBytes)
    }
  })
})

app.dock ? app.dock.hide() : false // disable dock icon on OS X

app.on('ready', () => {
  appIcon = new Tray(iconSet.ready)
  appIcon.setToolTip('Handover')
  const contextMenu = Menu.buildFromTemplate([
    {role: 'quit'},
  ])
  appIcon.setContextMenu(contextMenu)
  appIcon.on('drop-files', (e, paths) => {
    publisher.push(new FilePayload(paths[0]))
  })
  appIcon.on('drop-text', (e, text) => {
    publisher.push(new TextPayload(text))
  })
  globalShortcut.register('CmdOrCtrl+shift+c', () => {
    publisher.push(new TextPayload(clipboard.readText()))
  })
  globalShortcut.register('CmdOrCtrl+shift+v', () => {
    if (consumer.last) {
      client.fetch(consumer.last)
    } else {
      dialog.showErrorBox('Handover', 'There is nothing handed over to you ...')
    }
  })
})

app.on('will-quit', () => globalShortcut.unregisterAll())

const httpServer = http.createServer(buildWebApp(publisher).callback())
httpServer.on('listening', () => {
  httpPort = httpServer.address().port
  console.log('listening http://127.0.0.1:'+httpPort)
})
httpServer.listen(0) // random

