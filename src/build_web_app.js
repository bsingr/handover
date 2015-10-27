'use babel'

import fs from 'fs'
import koa from 'koa'

export default function (publisher) {
  var webApp = koa()

  webApp.use(function *(){
    var payload = publisher.last

    if (!payload) {
      this.status = 404
      return
    }
    this.type = payload.mime()
    this.body = payload.data()
    if (payload.path && !payload.mime().match(/(text|json|xml|gif|png|jpg)/)) {
      this.attachment(path.basename(payload.path))
    }
  })

  return webApp;
}
