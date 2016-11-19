import SerializableObjectGenerator from 'js-abstract-synchronizer/serializer/SerializableObject';
import _ from 'lodash';

const privates = Symbol('privates');

const simpleTypes = [
  Number,
  String,
  Boolean,
];

export default class Serializer {
  constructor({ prototypes = {}, serializerImplementation }) {
    const namesToPrototypesMap = new Map(_.map(prototypes, (value, key) => [key, value]));
    const prototypesToNamesMap = new Map(_.map(prototypes, (value, key) => [value, key]));
    this[privates] = {
      namesToPrototypesMap,
      prototypesToNamesMap,
      SerializableObject: SerializableObjectGenerator(this),
      serializerImplementation,
    };
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
    return this[privates].serializerImplementation.save(object);
  }

  reload(id) {
    return this[privates].serializerImplementation.reload(id);
  }

  getPrototype(prototypeName) {
    const result = this[privates].namesToPrototypesMap.get(prototypeName);

    return result;
  }

  getPrototypeName(prototype) {
    return this[privates].prototypesToNamesMap.get(prototype);
  }
}
