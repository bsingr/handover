'use babel'

import request from 'superagent'

export default function (hostname, port, callback) {
  request('http://'+hostname+':'+port)
    .send()
    .end(function(err, res){
      if (err) {
        console.log('Err', err)
        return
      }
      callback(res.text, res.body);
    })
}
