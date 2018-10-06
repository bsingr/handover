import Koa from 'koa'
import path from 'path'

export default function (publisher) {
  var webApp = new Koa()

  webApp.use(ctx => {
    var payload = publisher.last
    if (!payload) {
      ctx.response.status = 404
      return
    }

    ctx.response.type = payload.mime()
    ctx.response.body = payload.data()

    if (payload.path && !payload.mime().match(/(text|json|xml|gif|png|jpg)/)) {
      ctx.response.attachment(path.basename(payload.path))
    }
  })

  return webApp;
}
