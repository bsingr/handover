import {Menu, MenuItem} from 'electron';
import clearSharedItemAction from './actions/clearSharedItemAction';
import copyAction from './actions/copyAction';
import pasteAction from './actions/pasteAction';
import shareFileDialogAction from './actions/shareFileDialogAction';
import shortcutKeys from './shortcutKeys';

export default function createContextMenu(publisher, client, consumer) {
  const menu = new Menu();
  menu.append(new MenuItem({
    label: 'Clear shared item',
    accelerator: shortcutKeys.clearSharedItemAction,
    click: () => clearSharedItemAction(publisher)
  }));
  menu.append(new MenuItem({
    label: 'Share clipboard with others',
    accelerator: shortcutKeys.copyAction,
    click: () => copyAction(publisher)
  }));
  menu.append(new MenuItem({
    label: 'Share file with others',
    accelerator: shortcutKeys.shareFileDialogAction,
    click: () => shareFileDialogAction(publisher)
  }));
  menu.append(new MenuItem({
    label: 'Paste from handover',
    accelerator: shortcutKeys.pasteAction,
    click: () => pasteAction(client, consumer)
  }));
  menu.append(new MenuItem({type: 'separator'}));
  menu.append(new MenuItem({role: 'quit'}));
  return menu;
}

