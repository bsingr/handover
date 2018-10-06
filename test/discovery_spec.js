import assert from 'assert';
import Discovery from '../src/discovery';

describe('Discover', () => {
  let subject;

  beforeEach(() => subject = new Discovery());

  describe('#findNodeById', () => {
    // disabled because Discovery does not implement proper shutdown yet
    xit('returns undefined', () => {
      assert.equal(undefined, subject.findNodeById('foo'));
    });
  });
});
