import HTTPStatus from 'http-status';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

export default ({ middlewares = [], serializer }) => {
  const app = express();

  middlewares.forEach(middleware => app.use(middleware));

  app
    .use(cors())
    .use(bodyParser.json())
    .get('/object/:id', (req, res) => {
      const object = serializer.create({ id: req.params.id });
      object.reload()
        .then(() => res.json(JSON.parse(object.getSerializedStoredData())))
        .catch(() => res.status(HTTPStatus.NOT_FOUND).end());
    })
    .post('/object', (req, res) => {
      const object = serializer.createFromSerializedData(req.body);
      object.save()
        .then(() => res.json(JSON.parse(object.getSerializedStoredData())))
        .catch(() => res.status(HTTPStatus.NOT_FOUND).end());
    });

  return app;
};
