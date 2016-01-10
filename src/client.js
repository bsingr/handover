'use babel'

import request from 'superagent'
import EventEmitter from 'events'

export default class Client extends EventEmitter {
  constructor(consumer) {
    super()
    this.consumer = consumer
  }

  fetch() {
    var that = this
    var notice = this.consumer.last
    if (notice) {
      request('http://'+notice.address+':'+notice.data.httpPort)
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
