import {app, Menu, MenuItem, globalShortcut} from 'electron';
import copyAction from './actions/copyAction';
import pasteAction from './actions/pasteAction';
import shareFileDialogAction from './actions/shareFileDialogAction';

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
    click: () => copyAction(publisher)
  }));
  menu.append(new MenuItem({
    label: 'Share file with others',
    accelerator: 'CmdOrCtrl+shift+u',
    click: () => shareFileDialogAction(publisher)
  }));
  menu.append(new MenuItem({
    label: 'Paste from handover',
    accelerator: 'CmdOrCtrl+shift+v',
    click: () => pasteAction(client, consumer)
  }));
  menu.append(new MenuItem({type: 'separator'}));
  menu.append(new MenuItem({role: 'quit'}));

  globalShortcut.register('CmdOrCtrl+shift+c', () => copyAction(publisher));
  globalShortcut.register('CmdOrCtrl+shift+u', () => shareFileDialogAction(publisher));
  globalShortcut.register('CmdOrCtrl+shift+v', () => pasteAction(client, consumer));
  app.on('will-quit', () => globalShortcut.unregisterAll());

  return menu;
}

