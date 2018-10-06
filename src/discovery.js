import Discover from 'node-discover';
import EventEmitter from 'events';

const CHANNEL = 'handover';

export default class Discovery extends EventEmitter {
  constructor() {
    super();
    this.d = Discover();
    this.d.join(CHANNEL, this.handleReceive.bind(this));
  }

  stop() {
    this.d.leave(CHANNEL);
    this.d.stop();
  }

  send(data) {
    this.d.send(CHANNEL, data);
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
