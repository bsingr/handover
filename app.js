/* eslint-disable no-console */
import {app, Tray, dialog, clipboard} from 'electron';
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

let appIcon = null;
let httpPort = null;

const consumer = new Stack();
consumer.on('update', () => {
  let iconName = 'ready';
  if (consumer.last.data.payload) {
    const iconResolver = new IconResolver();
    iconName = iconResolver.dropIconName(consumer.last.data.payload.mime);
  }
  appIcon.setImage(iconSet[iconName]);
});

const discovery = new Discovery();
discovery.on('receive', notice => consumer.push(notice));

const publisher = new Stack();
publisher.on('update', () => {
  if (publisher.last) {
    discovery.send({
      httpPort: httpPort,
      payload: publisher.last.serialize()
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
  appIcon = new Tray(iconSet.ready);
  appIcon.setToolTip('Handover');
  const contextMenu = createContextMenu(publisher, sharingClient, consumer);
  appIcon.setContextMenu(contextMenu);
  appIcon.on('drop-files', (e, paths) => {
    publisher.push(new FilePayload(paths[0]));
  });
  appIcon.on('drop-text', (e, text) => {
    publisher.push(new TextPayload(text));
  });
});

const sharingHttpServer = http.createServer(buildSharingServer(publisher).callback());
sharingHttpServer.on('listening', () => {
  httpPort = sharingHttpServer.address().port;
  console.log('listening http://127.0.0.1:'+httpPort);
});
sharingHttpServer.listen(0); // random

