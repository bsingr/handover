import {dialog, clipboard} from 'electron';
import TextPayload from '../payloads/TextPayload';

export default function(publisher) {
  const clipboardText = clipboard.readText();
  if (clipboardText) {
    publisher.push(new TextPayload(clipboard.readText()));
  } else {
    dialog.showErrorBox('Handover', 'There is nothing in the clipboard ...');
  }
}
