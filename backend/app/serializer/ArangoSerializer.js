import { db } from 'js-abstract-synchronizer/servicesManager';

const privates = Symbol('privates');

export default class ArangoSerializer {
  constructor() {
    this[privates] = {
      collection: db.collection('all'),
    };
  }

  configure(dbName) {
    db.useDatabase('_system');

    return db.createDatabase(dbName)
      .then(() => db.useDatabase(dbName))
      .then(() => this[privates].collection.create());
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
    return this[privates].collection.firstExample({ id });
  }
}
