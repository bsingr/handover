import {globalShortcut} from 'electron';
import copyAction from './actions/copyAction';
import pasteAction from './actions/pasteAction';
import shareFileDialogAction from './actions/shareFileDialogAction';
import shortcutKeys from './shortcutKeys';

function registerGlobal({
  mainWindow,
  sharingPublisherStack,
  sharingClient,
  sharingConsumerStack
}) {
  globalShortcut.register(shortcutKeys.copyAction, () => copyAction(sharingPublisherStack));
  globalShortcut.register(shortcutKeys.shareFileDialogAction, () => shareFileDialogAction(mainWindow, sharingPublisherStack));
  globalShortcut.register(shortcutKeys.pasteAction, () => pasteAction(sharingClient, sharingConsumerStack));
}

function unregisterGlobal() {
  globalShortcut.unregisterAll();
}

export default {
  registerGlobal,
  unregisterGlobal
};

