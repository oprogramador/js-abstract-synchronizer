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
    return Promise.resolve(this.data[id]);
  }
}

