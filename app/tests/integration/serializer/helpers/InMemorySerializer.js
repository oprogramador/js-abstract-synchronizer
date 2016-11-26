import NotFoundError from 'js-abstract-synchronizer/errors/NotFoundError';

export default class InMemorySerializer {
  constructor() {
    this.data = {};
  }

  configure() {
    return Promise.resolve();
  }

  save(object) {
    this.data[object.id] = object;

    return Promise.resolve();
  }

  reload(id) {
    return this.data[id] ? Promise.resolve(this.data[id]) : Promise.reject(new NotFoundError());
  }
}
