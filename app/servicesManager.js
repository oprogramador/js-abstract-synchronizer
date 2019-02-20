import arangojs from 'arangojs';
import bunyan from 'bunyan';
import config from 'js-abstract-synchronizer/config';
import urlFormatter from 'url';
import packageInfo from '../package';

const logger = bunyan.createLogger({ name: packageInfo.name });
const url = urlFormatter.format({
  auth: `${config.db.username}:${config.db.password}`,
  hostname: config.db.host,
  port: config.db.port,
  protocol: 'http',
});
const db = arangojs({
  databaseName: config.db.name,
  url,
});

export {
  db,
  logger,
};
