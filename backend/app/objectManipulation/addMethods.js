import _ from 'lodash';

export default ({ source, target, targetInnerObject }) => {
  const prototypeMethods = _.difference(
    Object.getOwnPropertyNames(source.constructor.prototype),
    [...Object.getOwnPropertyNames(Object.prototype), 'constructor']
  );
  const ownMethods = _.filter(Object.keys(source), property => typeof source[property] === 'function');
  const allMethods = prototypeMethods.concat(ownMethods);
  allMethods.forEach((methodName) => {
    target[methodName] = (...args) => source[methodName].apply(targetInnerObject, args);
  });
};
