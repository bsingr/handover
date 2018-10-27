import Discover from 'node-discover';
import EventEmitter from 'events';

export default class Discovery extends EventEmitter {
  constructor(channel = 'handover') {
    super();
    this.channel = channel;
    this.d = Discover();
    this.d.join(this.channel, this.handleReceive.bind(this));
  }

  stop() {
    this.d.leave(this.channel);
    this.d.stop();
  }

  send(data) {
    this.d.send(this.channel, data);
  }

  handleReceive(data, obj) {
    this.emit('receive', {
      address: this.findNodeById(obj.iid).address,
      data: data,
      obj: obj
    });
  }

  findNodeById(id) {
    var node;
    this.d.eachNode((n) => {
      if (n.id === id) {
        node = n;
      }
    });
    return node;
  }
}
