/* eslint-disable no-console */
import {app, Tray, dialog, clipboard, BrowserWindow} from 'electron';
import fs from 'fs';
import mime from 'mime';
import http from 'http';
import IconResolver from './src/IconResolver';
import buildSharingServer from './src/buildSharingServer';
import TextPayload from './src/payloads/TextPayload';
import FilePayload from './src/payloads/FilePayload';
import SharingClient from './src/SharingClient';
import Stack from './src/Stack';
import Discovery from './src/Discovery';
import createContextMenu from './src/createContextMenu';
import iconSet from './src/iconSet';
import shortcuts from './src/shortcuts';

let mainWindow = null;
let appIcon = null;
let httpPort = null;

const sharingConsumerStack = new Stack();
sharingConsumerStack.on('update', () => {
  let iconName = 'ready';
  if (sharingConsumerStack.last.data.payload) {
    const iconResolver = new IconResolver();
    iconName = iconResolver.dropIconName(sharingConsumerStack.last.data.payload.mime);
  }
  appIcon.setImage(iconSet[iconName]);
});

const discovery = new Discovery();
discovery.on('receive', notice => sharingConsumerStack.push(notice));

const sharingPublisherStack = new Stack();
sharingPublisherStack.on('update', () => {
  if (sharingPublisherStack.last) {
    discovery.send({
      httpPort: httpPort,
      payload: sharingPublisherStack.last.serialize()
    });
  } else {
    discovery.send({
      httpPort: httpPort,
      payload: null
    });
  }
});

const sharingClient = new SharingClient();
sharingClient.on('error', console.error);
sharingClient.on('fetch', () => appIcon.setImage(iconSet.ready));
sharingClient.on('fetchText', text => clipboard.writeText(text));
sharingClient.on('fetchFile', (mimeType, path, dataBytes) => {
  dialog.showSaveDialog({
    title: 'Choose location to store the .' + mime.getExtension(mimeType) + ' file'
  }, destinationPath => {
    if (destinationPath) {
      fs.writeFileSync(destinationPath, dataBytes);
    }
  });
});

app.dock ? app.dock.hide() : false; // disable dock icon on OS X

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    transparent: true,
    frame: false
  });
  mainWindow.setIgnoreMouseEvents(true);

  shortcuts.registerGlobal({
    mainWindow,
    sharingPublisherStack,
    sharingClient,
    sharingConsumerStack,
  });

  appIcon = new Tray(iconSet.ready);
  appIcon.setToolTip('Handover');
  appIcon.setContextMenu(createContextMenu(mainWindow, sharingPublisherStack, sharingClient, sharingConsumerStack));
  appIcon.on('drop-files', (e, paths) => {
    sharingPublisherStack.push(new FilePayload(paths[0]));
  });
  appIcon.on('drop-text', (e, text) => {
    sharingPublisherStack.push(new TextPayload(text));
  });
});

app.on('will-quit', () => {
  mainWindow.close();
  shortcuts.unregisterGlobal();
});

const sharingHttpServer = http.createServer(buildSharingServer(sharingPublisherStack).callback());
sharingHttpServer.on('listening', () => {
  httpPort = sharingHttpServer.address().port;
  console.log('listening http://127.0.0.1:'+httpPort);
});
sharingHttpServer.listen(0); // random

