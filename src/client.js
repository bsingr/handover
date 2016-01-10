'use babel'

import request from 'superagent'
import EventEmitter from 'events'

export default class Client extends EventEmitter {
  constructor(discover, consumer) {
    super()
    this.discover = discover
    this.consumer = consumer
  }

  fetch() {
    var that = this
    var notice = this.consumer.last
    var node = this.discover.lastNode()
    if (notice && node) {
      request('http://'+node.address+':'+notice.data.httpPort)
        .send()
        .end((err, res) => {
          if (err) {
            console.log('Err', err)
            return
          }
          that.emit('fetch')
          var mimeType = notice.data.payload.mime
          if (mimeType === 'text/plain') {
            that.emit('fetchText', res.text);
          } else {
            that.emit('fetchFile', mimeType, notice.data.payload.path, res.body)
          }
        })
    }
  }
}
