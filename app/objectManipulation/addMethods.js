import _ from 'lodash';

const addArrayMethods = ({ getTargetInnerObject, target }) => {
  target.get = function get(index) {
    return getTargetInnerObject()[index];
  };

  target.set = function set(index, value) {
    getTargetInnerObject()[index] = value;
  };

  target.size = function size() {
    return getTargetInnerObject().length;
  };
};

export default ({ getTargetInnerObject, prototype, target }) => {
  const allMethodsNames = _.difference(
    _.filter(Object.getOwnPropertyNames(prototype), property => typeof prototype[property] === 'function'),
    [...Object.getOwnPropertyNames(Object.prototype), 'constructor'],
  );
  allMethodsNames.forEach((methodName) => {
    target[methodName] = (...args) => prototype[methodName].apply(getTargetInnerObject(), args);
  });
  if (Array.isArray(prototype)) {
    addArrayMethods({ getTargetInnerObject, target });
  }
};
