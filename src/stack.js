import EventEmitter from 'events'

export default class Stack extends EventEmitter  {
  push(item) {
    this.last = item
    this.emit('update')
  }
}
