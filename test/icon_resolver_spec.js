import assert from 'assert'
import IconResolver from '../src/icon_resolver'

describe('IconResolver', () => {
  let subject

  beforeEach(() => subject = new IconResolver())

  describe('#dropIconName', () => {
    it('returns', () => {
      assert.equal('dropAny', subject.dropIconName('foo'))
      assert.equal('dropImage', subject.dropIconName('image'))
      assert.equal('dropText', subject.dropIconName('text'))
    })
  })
})
