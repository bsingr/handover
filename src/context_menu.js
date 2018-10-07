import {app, Menu, MenuItem, globalShortcut} from 'electron';
import {handleCopy, handlePaste, shareFile} from './util';

export default function createContextMenu(publisher, client, consumer) {
  const menu = new Menu();
  menu.append(new MenuItem({
    label: 'Clear shared item',
    accelerator: 'CmdOrCtrl+shift+c',
    click: () => publisher.clear()
  }));
  menu.append(new MenuItem({
    label: 'Share clipboard with others',
    accelerator: 'CmdOrCtrl+shift+c',
    click: () => handleCopy(publisher)
  }));
  menu.append(new MenuItem({
    label: 'Share file with others',
    accelerator: 'CmdOrCtrl+shift+u',
    click: () => shareFile(publisher)
  }));
  menu.append(new MenuItem({
    label: 'Paste from handover',
    accelerator: 'CmdOrCtrl+shift+v',
    click: () => handlePaste(client, consumer)
  }));
  menu.append(new MenuItem({type: 'separator'}));
  menu.append(new MenuItem({role: 'quit'}));

  globalShortcut.register('CmdOrCtrl+shift+c', () => handleCopy(publisher));
  globalShortcut.register('CmdOrCtrl+shift+u', () => shareFile(publisher));
  globalShortcut.register('CmdOrCtrl+shift+v', () => handlePaste(client, consumer));
  app.on('will-quit', () => globalShortcut.unregisterAll());

  return menu;
}

