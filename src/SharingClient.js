import request from 'superagent';
import EventEmitter from 'events';

export default class SharingClient extends EventEmitter {
  fetch(notice) {
    request('http://'+notice.address+':'+notice.data.httpPort)
      .send()
      .end((err, res) => {
        if (err) {
          this.emit('error', err);
          return;
        }
        this.emit('fetch');
        var mimeType = notice.data.payload.mime;
        if (mimeType === 'text/plain') {
          this.emit('fetchText', res.text);
        } else {
          this.emit('fetchFile', mimeType, notice.data.payload.path, res.body);
        }
      });
  }
}
