import {Menu, Tray} from 'electron'

export default class ContextMenu {
  static createForAppIcon(appIcon: Tray): void {
    const contextMenu = Menu.buildFromTemplate([
      {role: 'quit'},
    ])
    appIcon.setContextMenu(contextMenu)
  }
}

