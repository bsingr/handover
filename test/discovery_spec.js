import assert from 'assert'
import Discovery from '../src/discovery'

describe('Discover', () => {
  let subject

  beforeEach(() => subject = new Discovery())

  describe('#findNodeById', () => {
    xit('returns undefined', () => {
      assert.equal(undefined, subject.findNodeById('foo'))
    })
  })
})
