import {dialog, clipboard} from 'electron'
import TextPayload from './text_payload'

export function handleCopy(publisher) {
  const clipboardText = clipboard.readText()
  if (clipboardText) {
    publisher.push(new TextPayload(clipboard.readText()))
  } else {
    dialog.showErrorBox('Handover', 'There is nothing in the clipboard ...')
  }
}

export function handlePaste(client, consumer) {
  if (consumer.last) {
    client.fetch(consumer.last)
  } else {
    dialog.showErrorBox('Handover', 'There is nothing handed over to you ...')
  }
}

export function shareFile(publisher) {
  dialog.showOpenDialog(
    {
      buttonLabel: 'Share'
    },
    filePaths => {
      if (Array.isArray(filePaths) && filePaths.length > 0) {
        publisher.push(new FilePayload(filePaths[0]))
      }
    }
  )
}

