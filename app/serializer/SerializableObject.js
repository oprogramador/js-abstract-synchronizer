import InvalidIdError from 'js-abstract-synchronizer/errors/InvalidIdError';
import NotFoundError from 'js-abstract-synchronizer/errors/NotFoundError';
import _ from 'lodash';
import addMethods from 'js-abstract-synchronizer/objectManipulation/addMethods';
import uuid from 'uuid';

const privates = Symbol('privates');
const saveWithoutReferences = Symbol('saveWithoutReferences');
const createData = Symbol('createData');
const getDataToSerialize = Symbol('getDataToSerialize');
const addMethodsToThis = Symbol('addMethodsToThis');
const validateId = Symbol('validateId');
const createSerializedData = Symbol('createSerializedData');

export default serializer => class SerializableObject {
  constructor({ object, prototypeName }) {
    const id = _.isUndefined(object.id) ? uuid.v4() : object.id;
    this[validateId](id);
    this[privates] = {
      id,
      isBeingSaved: false,
      prototypeName,
      storedData: null,
    };
    this[privates].currentData = this[createData](object);
    this[addMethodsToThis](prototypeName);
    if (this.validate) {
      this.validate(object);
    }
  }

  [validateId](id) {
    if (typeof id !== 'string') {
      throw new InvalidIdError('id must be a string');
    }
    if (id === '') {
      throw new InvalidIdError('id cannot be empty');
    }
  }

  [addMethodsToThis](prototypeName) {
    const proto = serializer.getPrototype(prototypeName);
    if (proto) {
      addMethods({
        getTargetInnerObject: () => this[privates].currentData.data,
        prototype: proto,
        target: this,
      });
    }
  }

  [createData](object) {
    return {
      data: _.cloneDeep(_.omit(object, 'id')),
      id: this[privates].id,
      prototypeName: this[privates].prototypeName,
    };
  }

  [saveWithoutReferences]() {
    const data = this[getDataToSerialize]();

    return (
      _.isUndefined(data.prototypeName)
        ? this.reload()
            .then(() => this[getDataToSerialize]())
        : Promise.resolve(data)
    )
      .catch(error => (error instanceof NotFoundError ? data : Promise.reject(error)))
      .then(dataToSave => serializer.save(dataToSave))
      .then(() => {
        this[privates].storedData = this[createData](this[privates].currentData.data);
        this[privates].isBeingSaved = false;
      });
  }

  [getDataToSerialize]() {
    return this[createSerializedData](this[privates].currentData);
  }

  save() {
    const objectsToSave = [];
    _.map(this[privates].currentData.data, (value, key) => {
      if (typeof value === 'object' && !((value instanceof SerializableObject) && value.isBeingSaved())) {
        const child = value instanceof SerializableObject ? value : serializer.create(value);
        child.setIsBeingSaved();
        objectsToSave.push(child);
        this[privates].currentData.data[key] = child;
      }
    });

    return Promise.all([this[saveWithoutReferences](), ...objectsToSave.map(object => object.save())]);
  }

  reload() {
    return serializer.reload(this[privates].currentData.id)
      .then((newObject) => {
        const filteredObject = _.pick(newObject, ['id', 'data', 'prototypeName']);
        const newObjectWithReferences = Object.assign(
          filteredObject,
          {
            data: _.mapValues(filteredObject.data, (value, key) => {
              const oldValue = this[privates].currentData.data[key];

              return oldValue instanceof SerializableObject && value.id === oldValue.getId()
                ? oldValue
                : serializer.create(value);
            }),
          }
        );
        this[privates].storedData = _.cloneDeep(newObjectWithReferences);
        this[privates].currentData = _.cloneDeep(newObjectWithReferences);
        this[addMethodsToThis](filteredObject.prototypeName);
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

  [createSerializedData](data) {
    if (!data || !data.data) {
      return data;
    }

    return Object.assign({}, data, {
      data: _.mapValues(data.data, value => (value instanceof SerializableObject ? { id: value.getId() } : value)),
    });
  }

  getSerializedStoredData() {
    return JSON.stringify(this[createSerializedData](this[privates].storedData));
  }

  getSerializedCurrentData() {
    return JSON.stringify(this[createSerializedData](this[privates].currentData));
  }
};
