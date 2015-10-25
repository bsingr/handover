'use babel'

import fs from 'fs'
import koa from 'koa'

export function buildWebApp(lastSend) {
  var webApp = koa()

  webApp.use(function *(){
    var data = lastSend.data

    if (!data) {
      this.status = 404
      return
    }
    this.type = data.mime
    if (data.payload) {
      this.body = data.payload
    } else if (data.path) {
      this.body = fs.createReadStream(data.path)
    }
    if (data.path && !data.mime.match(/(text|json|xml|gif|png|jpg)/)) {
      this.attachment(path.basename(data.path))
    }
  })

  return webApp;
}
