import _ from 'lodash';
import addMethods from 'js-abstract-synchronizer/objectManipulation/addMethods';
import uuid from 'node-uuid';

const privates = Symbol('privates');

export default class SerializableObject {
  constructor({ object, serializer }) {
    const id = uuid.v4();
    this[privates] = {
      currentData: Object.assign({ id }, _.cloneDeep(object)),
      serializer,
      storedData: {},
    };
    addMethods({ getTargetInnerObject: () => this[privates].currentData, source: object, target: this });
  }

  save() {
    return this[privates].serializer.save(this[privates].currentData)
      .then(() => {
        this[privates].storedData = _.cloneDeep(this[privates].currentData);
      });
  }

  reload() {
    return this[privates].serializer.reload(this[privates].currentData.id)
      .then((newObject) => {
        this[privates].storedData = _.cloneDeep(newObject);
        this[privates].currentData = _.cloneDeep(newObject);
      });
  }

  reset() {
    this[privates].currentData = _.cloneDeep(this[privates].storedData);
  }

  isDirty() {
    return !_.isEqual(this[privates].currentData, this[privates].storedData);
  }
}
