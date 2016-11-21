import HTTPStatus from 'http-status';
import InMemorySerializer from
  'js-abstract-synchronizer/tests/integration/serializer/helpers/InMemorySerializer';
import Serializer from 'js-abstract-synchronizer/serializer/Serializer';
import createApp from 'js-abstract-synchronizer/routing/createApp';
import expect from 'js-abstract-synchronizer/tests/expect';
import request from 'supertest-as-promised';

class Person {
  constructor({ name, surname }) {
    this.name = name;
    this.surname = surname;
  }
  getName() {
    return this.name;
  }
  getSurname() {
    return this.surname;
  }
  setName(name) {
    this.name = name;
  }
  setSurname(surname) {
    this.surname = surname;
  }
}

const createTestApp = () => {
  const serializer = new Serializer({
    prototypes: {
      Person: Person.prototype,
    },
    serializerImplementation: new InMemorySerializer(),
  });

  return {
    app: createApp({
      loggerMiddleware: (req, res, next) => next(),
      serializer,
    }),
    serializer,
  };
};

describe('serializer API', () => {
  describe('GET', () => {
    it('returns not found status for a non-existent id', () => {
      const { app } = createTestApp();

      return request(app)
        .get('/object/non-existent')
        .expect(HTTPStatus.NOT_FOUND);
    });
  });

  describe('POST', () => {
    it('returns bad request status for validation error');
  });

  it('saves and reloads object', () => {
    const { app } = createTestApp();
    const object = new Person({ name: 'Bob', surname: 'Boo' });

    return request(app)
      .post('/object')
      .send(object)
      .then(({ body }) =>
        request(app)
          .get(`/object/${body.id}`)
          .expect(HTTPStatus.OK)
          .expect(({ body: reloadBody }) => expect(reloadBody.data).to.deep.equal(object))
      );
  });
});
