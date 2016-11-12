import _ from 'lodash';
import uuid from 'node-uuid';

const privates = Symbol('privates');
const addMethods = Symbol('addMethods');

export default class SerializableObject {
  constructor({ object, serializer }) {
    this[privates] = {
      innerObject: _.cloneDeep(object),
      serializer,
    };
    this[addMethods](object);
  }

  [addMethods](object) {
    const prototypeMethods = _.difference(
      Object.getOwnPropertyNames(object.constructor.prototype),
      [...Object.getOwnPropertyNames(Object.prototype), 'constructor']
    );
    const ownMethods = _.filter(Object.keys(object), property => typeof object[property] === 'function');
    const allMethods = prototypeMethods.concat(ownMethods);
    allMethods.forEach((methodName) => {
      this[methodName] = (...args) => {
        object[methodName].apply(this[privates].innerObject, args);
      };
    });
  }

  save() {
    this[privates].innerObject.id = this[privates].innerObject.id || uuid.v4();

    return this[privates].serializer.save(this[privates].innerObject);
  }

  reload() {
    return this[privates].serializer.reload(this[privates].innerObject)
      .then((newObject) => {
        this[privates].innerObject = newObject;
      });
  }

  getInnerObject() {
    return _.cloneDeep(this[privates].innerObject);
  }
}
