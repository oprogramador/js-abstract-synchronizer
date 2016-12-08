import directCreateApp from 'js-abstract-synchronizer/routing/createApp';
import directSerializerFactory from 'js-abstract-synchronizer/serializer/SerializerFactory';
import expect from 'js-abstract-synchronizer/tests/expect';

describe('index', () => {
  afterEach('clear global window', () => {
    delete global.window;
  });

  afterEach('clear require cache', () => {
    delete require.cache[require.resolve('js-abstract-synchronizer/index')];
  });

  it('returns SerializerFactory', () => {
    // eslint-disable-next-line global-require
    const SerializerFactory = require('js-abstract-synchronizer/index').SerializerFactory;

    expect(SerializerFactory).to.equal(directSerializerFactory);
  });

  it('returns createApp when not in browser', () => {
    // eslint-disable-next-line global-require
    const createApp = require('js-abstract-synchronizer/index').createApp;

    expect(createApp).to.equal(directCreateApp);
  });

  it('does not return createApp when in browser', () => {
    global.window = {};
    // eslint-disable-next-line global-require
    const createApp = require('js-abstract-synchronizer/index').createApp;

    expect(createApp).to.be.undefined();
  });
});
