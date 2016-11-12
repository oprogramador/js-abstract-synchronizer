import _ from 'lodash';
import addMethods from 'js-abstract-synchronizer/objectManipulation/addMethods';
import uuid from 'node-uuid';

const privates = Symbol('privates');

export default class SerializableObject {
  constructor({ object, serializer }) {
    this[privates] = {
      innerObject: _.cloneDeep(object),
      serializer,
    };
    addMethods({ getTargetInnerObject: () => this[privates].innerObject, source: object, target: this });
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
}
