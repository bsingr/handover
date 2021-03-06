import assert from 'assert';
import Stack from '../src/Stack';

describe('Stack', () => {
  let subject;

  beforeEach(() => subject = new Stack());

  describe('#last', () => {
    it('returns undefined', () => {
      assert.equal(undefined, subject.last);
    });
  });

  describe('#push + #last', () => {
    it('returns data after push', () => {
      subject.push('foo');
      assert.equal('foo', subject.last);
    });
  });
});
