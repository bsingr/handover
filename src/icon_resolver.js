'use babel'

export default class IconResolver {
  dropIconName(mime) {
    if (mime) {
      if (mime.match(/text/)) {
        return 'dropText'
      } else if (mime.match(/image/)) {
        return 'dropImage'
      }
    }
    return 'dropAny'
  }
}
