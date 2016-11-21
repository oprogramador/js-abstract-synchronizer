import ArangoSerializer from 'js-abstract-synchronizer/serializer/ArangoSerializer';
import ExpressBunyanLogger from 'express-bunyan-logger';
import Serializer from 'js-abstract-synchronizer/serializer/Serializer';
import createApp from 'js-abstract-synchronizer/routing/createApp';
import { logger } from 'js-abstract-synchronizer/servicesManager';

const serializerImplementation = new ArangoSerializer();
const serializer = new Serializer({
  serializerImplementation,
});

serializerImplementation.configure('db')
  .then(() => {
    const port = 3000;
    const app = createApp({
      loggerMiddleware: ExpressBunyanLogger(),
      serializer,
    });
    app.listen(port);
    logger.info(`Running on http://localhost: ${port}`);
  });
