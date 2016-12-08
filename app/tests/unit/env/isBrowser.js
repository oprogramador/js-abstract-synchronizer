import expect from 'js-abstract-synchronizer/tests/expect';
import isBrowser from 'js-abstract-synchronizer/env/isBrowser';

describe('isBrowser', () => {
  afterEach('clear global window', () => {
    delete global.window;
  });

  it('returns true when global window is defined', () => {
    global.window = {};
    expect(isBrowser()).to.be.true();
  });

  it('returns false when global window is not defined', () => {
    expect(isBrowser()).to.be.false();
  });
});

