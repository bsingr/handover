import {dialog, clipboard} from 'electron';
import TextPayload from '../text_payload';

export default function copyAction(publisher) {
  const clipboardText = clipboard.readText();
  if (clipboardText) {
    publisher.push(new TextPayload(clipboard.readText()));
  } else {
    dialog.showErrorBox('Handover', 'There is nothing in the clipboard ...');
  }
}
