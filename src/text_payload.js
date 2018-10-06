export default class TextPayload {
  constructor(text) {
    this.text = text
  }

  mime() {
    return 'text/plain'
  }

  data() {
    return this.text
  }

  serialize() {
    return {
      type: 'TextPayload',
      mime: this.mime(),
      text: this.text
    }
  }
}
