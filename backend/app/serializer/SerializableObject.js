import _ from 'lodash';
import addMethods from 'js-abstract-synchronizer/objectManipulation/addMethods';
import uuid from 'node-uuid';

const privates = Symbol('privates');
const saveWithoutReferences = Symbol('saveWithoutReferences');
const createData = Symbol('createData');
const getDataToSerialize = Symbol('getDataToSerialize');

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
    return this[privates].serializer.save(this[getDataToSerialize]())
      .then(() => {
        this[privates].storedData = this[createData](this[privates].currentData.data);
        this[privates].isBeingSaved = false;
      });
  }

  [getDataToSerialize]() {
    const transform = value => (typeof value === 'object' ? { id: value.getId() } : value);
    const data = Array.isArray(this[privates].currentData.data)
      ? this[privates].currentData.data.map(transform)
      : _.mapValues(this[privates].currentData.data, transform);

    return {
      data,
      id: this[privates].id,
      type: this[privates].currentData.type,
    };
  }

  save() {
    const objectsToSave = [];
    _.map(this[privates].currentData.data, (value, key) => {
      if (typeof value === 'object') {
        const child = value instanceof SerializableObject ? value : this[privates].serializer.create(value);
        child.setIsBeingSaved();
        objectsToSave.push(child);
        this[privates].currentData.data[key] = child;
      }
    });

    return Promise.all([this[saveWithoutReferences](), ...objectsToSave.map(object => object.save())]);
  }

  reload() {
    return this[privates].serializer.reload(this[privates].currentData.id)
      .then((newObject) => {
        const newObjectWithReferences = _.cloneDeep(newObject);
        _.map(newObjectWithReferences.data, (value, key) => {
          if (
              typeof value === 'object'
                && this[privates].currentData.data[key] instanceof SerializableObject
                && value.id === this[privates].currentData.data[key].getId()
            ) {
            newObjectWithReferences.data[key] = this[privates].currentData.data[key];
          }
        });
        this[privates].storedData = _.cloneDeep(newObjectWithReferences);
        this[privates].currentData = _.cloneDeep(newObjectWithReferences);
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
