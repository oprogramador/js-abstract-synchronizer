import SerializableObjectGenerator from 'js-abstract-synchronizer/serializer/SerializableObject';
import _ from 'lodash';
import { db } from 'js-abstract-synchronizer/servicesManager';

const privates = Symbol('privates');

const simpleTypes = [
  Number,
  String,
  Boolean,
];

export default class Serializer {
  constructor({ prototypes = {} } = {}) {
    const namesToPrototypesMap = new Map(_.map(prototypes, (value, key) => [key, value]));
    const prototypesToNamesMap = new Map(_.map(prototypes, (value, key) => [value, key]));
    this[privates] = {
      collection: db.collection('all'),
      namesToPrototypesMap,
      prototypesToNamesMap,
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
    if (object instanceof this[privates].SerializableObject) {
      return object;
    }
    if (simpleTypes.includes(object.constructor)) {
      return object;
    }
    const prototypeName = this.getPrototypeName(object.constructor.prototype);
    const serializableObject = new this[privates].SerializableObject({ object, prototypeName });

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

  getPrototype(prototypeName) {
    const result = this[privates].namesToPrototypesMap.get(prototypeName);

    return result;
  }

  getPrototypeName(prototype) {
    return this[privates].prototypesToNamesMap.get(prototype);
  }
}
