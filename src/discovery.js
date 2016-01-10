import Discover from 'node-discover'

const CHANNEL = 'clipboard'

export default class Discovery {
  constructor(consumer) {
    this.d = Discover();
    this.consumer = consumer;
    this.d.join(CHANNEL, (data, obj) => {
      consumer.push({
        data: data,
        obj: obj
      })
    });
  }

  announce(data) {
    this.d.send(CHANNEL, data);
  }

  lastNode() {
    var last = this.consumer.last
    if (last) {
      return this.findNodeById(last.obj.iid)
    }
  }

  findNodeById(id) {
    var node;
    this.d.eachNode((n) => {
      if (n.id === id) {
        node = n
      }
    })
    return node
  }
}
