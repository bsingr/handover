'use babel'

import NativeImage from 'native-image'

export const icon = NativeImage.createFromPath(__dirname + '/../resources/icon.png')

const dropIcons = {
  'any': NativeImage.createFromPath(__dirname + '/../resources/icon-drop-any.png'),
  'image': NativeImage.createFromPath(__dirname + '/../resources/icon-drop-image.png'),
  'text': NativeImage.createFromPath(__dirname + '/../resources/icon-drop-text.png')
}

export default class Icon {
  defaultIcon() {
    return icon
  }

  dropIcon(data) {
    return dropIcons[this.dropIconName(data)]
  }

  dropIconName(data) {
    if (data.mime.match(/text/)) {
      return 'text'
    } else if (data.mime.match(/image/)) {
      return 'image'
    } else {
      return 'any'
    }
  }
}
