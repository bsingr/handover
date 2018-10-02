import {app, Menu, MenuItem, globalShortcut} from 'electron'
import IconResolver from '../icon_resolver'
import {handleCopy, handlePaste} from '../util'

export default function createContextMenu(publisher, client, consumer) {
  const menu = new Menu()
  menu.append(new MenuItem({
    label: 'Copy from clipboard',
    accelerator: 'CmdOrCtrl+shift+c',
    click: () => handleCopy(publisher)
  }))
  menu.append(new MenuItem({
    label: 'Paste from handover',
    accelerator: 'CmdOrCtrl+shift+v',
    click: () => handlePaste(client, consumer)
  }))
  menu.append(new MenuItem({role: 'quit'}))

  globalShortcut.register('CmdOrCtrl+shift+c', () => handleCopy(publisher))
  globalShortcut.register('CmdOrCtrl+shift+v', () => handlePaste(client, consumer))
  app.on('will-quit', () => globalShortcut.unregisterAll())

  consumer.on('update', () => {
    const iconResolver = new IconResolver()
    const iconName = iconResolver.dropIconName(consumer.last.data.payload.mime)

    if (iconName === 'dropAny') {
    } else if (iconName === 'dropImage') {
    } else if (iconName === 'dropText') {
    }
  })

  return menu
}

