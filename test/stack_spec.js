'use babel'

import assert from 'assert'
import Stack from '../src/stack'

describe('Stack', () => {
  let stack

  beforeEach(() => stack = new Stack())

  describe('#last', () => {
    it('returns undefined', () => {
      assert.equal(undefined, stack.last)
    })
  })

  describe('#push + #last', () => {
    it('returns data after push', () => {
      stack.push('foo')
      assert.equal('foo', stack.last)
    })
  })
})
