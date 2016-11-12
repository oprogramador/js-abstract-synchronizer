import _ from 'lodash';
import addMethods from 'js-abstract-synchronizer/objectManipulation/addMethods';
import uuid from 'node-uuid';

const privates = Symbol('privates');
const saveWithoutReferences = Symbol('saveWithoutReferences');
const createData = Symbol('createData');

export default class SerializableObject {
  constructor({ object, serializer }) {
    const id = object.id || uuid.v4();
    this[privates] = {
      id,
      isBeingSaved: false,
      serializer,
      storedData: {},
    };
    this[privates].currentData = this[createData](object);
    addMethods({ getTargetInnerObject: () => this[privates].currentData.data, source: object, target: this });
  }

  [createData](object) {
    return {
      data: _.cloneDeep(object),
      id: this[privates].id,
      type: Array.isArray(object) ? 'array' : 'object',
    };
  }

  [saveWithoutReferences]() {
    return this[privates].serializer.save(this[privates].currentData)
      .then(() => {
        this[privates].storedData = this[createData](this[privates].currentData.data);
        this[privates].isBeingSaved = false;
      });
  }

  save() {
    const objectsToSave = [];
    _.map(this[privates].currentData.data, (value) => {
      if (typeof value === 'object') {
        const child = value instanceof SerializableObject ? value : this[privates].serializer.create(value);
        child.setIsBeingSaved();
        objectsToSave.push(child);
      }
    });

    return Promise.all([this[saveWithoutReferences](), ...objectsToSave.map(object => object.save())]);
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

  setIsBeingSaved() {
    this[privates].isBeingSaved = true;
  }

  isBeingSaved() {
    return this[privates].isBeingSaved;
  }

  getId() {
    return this[privates].id;
  }
}
