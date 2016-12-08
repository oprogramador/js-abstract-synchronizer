import SerializerFactory from 'js-abstract-synchronizer/serializer/SerializerFactory';
import isBrowser from 'js-abstract-synchronizer/env/isBrowser';

module.exports.SerializerFactory = SerializerFactory;

if (!isBrowser()) {
  // eslint-disable-next-line global-require
  const createApp = require('js-abstract-synchronizer/routing/createApp').default;

  module.exports.createApp = createApp;
}
