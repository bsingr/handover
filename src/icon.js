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

  dropIcon(mime) {
    return dropIcons[this.dropIconName(mime)]
  }

  dropIconName(mime) {
    if (mime) {
      if (mime.match(/text/)) {
        return 'text'
      } else if (mime.match(/image/)) {
        return 'image'
      }
    }
    return 'any'
  }
}
