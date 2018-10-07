import {dialog} from 'electron';
import FilePayload from '../payloads/FilePayload';

export default function(mainWindow, publisher) {
  mainWindow.show()
  dialog.showOpenDialog(
    {
      buttonLabel: 'Share'
    },
    filePaths => {
      mainWindow.hide()
      if (Array.isArray(filePaths) && filePaths.length > 0) {
        publisher.push(new FilePayload(filePaths[0]));
      }
    }
  );
}

