import ArangoSerializer from 'js-abstract-synchronizer/serializer/ArangoSerializer';
import HttpSerializer from 'js-abstract-synchronizer/serializer/HttpSerializer';
import Serializer from 'js-abstract-synchronizer/serializer/Serializer';
import createApp from 'js-abstract-synchronizer/routing/createApp';
import { db } from 'js-abstract-synchronizer/servicesManager';
import runSerializerBasicTests from
  'js-abstract-synchronizer/tests/integration/serializer/helpers/runSerializerBasicTests';

let listener;
const port = 1234;
const url = `http://localhost:${port}`;

describe('HttpSerializer', () => {
  beforeEach('create app', () => {
    const serializerImplementation = new ArangoSerializer({ db });
    const serializer = new Serializer({
      serializerImplementation,
    });
    const app = createApp({
      loggerMiddleware: (req, res, next) => next(),
      serializer,
    });
    listener = app.listen(port);
  });

  afterEach('destroy app', () => {
    listener.close();
  });

  runSerializerBasicTests(() => new HttpSerializer({ url }));
});
