import _ from 'lodash';

const addArrayMethods = ({ getTargetInnerObject, target }) => {
  target.get = function get(index) {
    return getTargetInnerObject()[index];
  };

  target.set = function set(index, value) {
    getTargetInnerObject()[index] = value;
  };
};

export default ({ getTargetInnerObject, source, target }) => {
  const prototypeMethods = _.difference(
    Object.getOwnPropertyNames(source.constructor.prototype),
    [...Object.getOwnPropertyNames(Object.prototype), 'constructor']
  );
  const ownMethods = _.filter(Object.keys(source), property => typeof source[property] === 'function');
  const allMethods = prototypeMethods.concat(ownMethods);
  allMethods.forEach((methodName) => {
    target[methodName] = (...args) => source[methodName].apply(getTargetInnerObject(), args);
  });
  if (Array.isArray(source)) {
    addArrayMethods({ getTargetInnerObject, target });
  }
};
