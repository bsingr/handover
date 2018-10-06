import mime from 'mime'
import fs from 'fs'

export default class FilePayload {
  constructor(path) {
    this.path = path
  }

  mime() {
    return mime.getType(this.path)
  }

  data() {
    return fs.createReadStream(this.path)
  }

  serialize() {
    return {
      type: 'FilePayload',
      mime: this.mime(),
      path: this.path
    }
  }
}
