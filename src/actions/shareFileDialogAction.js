import {dialog} from 'electron';
import FilePayload from '../file_payload';

export default function shareFileDialogAction(publisher) {
  dialog.showOpenDialog(
    {
      buttonLabel: 'Share'
    },
    filePaths => {
      if (Array.isArray(filePaths) && filePaths.length > 0) {
        publisher.push(new FilePayload(filePaths[0]));
      }
    }
  );
}

