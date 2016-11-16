import SerializableObjectGenerator from 'js-abstract-synchronizer/serializer/SerializableObject';
import { db } from 'js-abstract-synchronizer/servicesManager';

const privates = Symbol('privates');

export default class Serializer {
  constructor() {
    this[privates] = {
      collection: db.collection('all'),
      SerializableObject: SerializableObjectGenerator(this),
    };
  }

  createDatabase(name) {
    db.useDatabase('_system');

    return db.createDatabase(name)
      .then(() => db.useDatabase(name));
  }

  createCollection() {
    return this[privates].collection.create();
  }

  create(object) {
    const serializableObject = new this[privates].SerializableObject({ object });

    return serializableObject;
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
