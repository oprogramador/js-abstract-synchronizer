import NotFoundError from 'js-abstract-synchronizer/errors/NotFoundError';
import arangoErrorCodes from 'arangodb-error-codes';

const privates = Symbol('privates');
const handleDuplicateName = error => (
  error.errorNum === arangoErrorCodes.ERROR_ARANGO_DUPLICATE_NAME
    ? Promise.resolve()
    : Promise.reject(error)
);

export default class ArangoSerializer {
  constructor({ db }) {
    this[privates] = {
      collection: db.collection('all'),
      db,
    };
  }

  configure(dbName) {
    const { db } = this[privates];
    db.useDatabase('_system');

    return db.createDatabase(dbName)
      .catch(handleDuplicateName)
      .then(() => db.useDatabase(dbName))
      .then(() => this[privates].collection.create())
      .catch(handleDuplicateName);
  }

  save(object) {
    return this[privates].collection.replaceByExample({ id: object.id }, object)
      .then(result => (
        result.replaced === 0
          ? this[privates].collection.save(object)
          : null
      ));
  }

  reload(id) {
    return this[privates].collection.firstExample({ id })
      .catch(error => Promise.reject(
        error.errorNum === arangoErrorCodes.ERROR_HTTP_NOT_FOUND
          ? new NotFoundError()
          : error,
      ));
  }
}
