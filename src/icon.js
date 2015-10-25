'use babel'

export function resolveDropIcon(data) {
  if (data.mime.match(/text/)) {
    return 'text'
  } else if (data.mime.match(/image/)) {
    return 'image'
  } else {
    return 'any'
  }
}
