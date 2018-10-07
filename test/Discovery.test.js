import assert from 'assert';
import Discovery from '../src/Discovery';

describe('Discover', () => {
  let subject;

  beforeEach(() => subject = new Discovery());
  afterEach(() => subject.stop());

  describe('#findNodeById', () => {
    it('returns undefined', () => {
      assert.equal(undefined, subject.findNodeById('foo'));
    });
  });
});
