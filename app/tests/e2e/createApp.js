import HTTPStatus from 'http-status';
import InMemorySerializer from
  'js-abstract-synchronizer/tests/integration/serializer/helpers/InMemorySerializer';
import Serializer from 'js-abstract-synchronizer/serializer/Serializer';
import createApp from 'js-abstract-synchronizer/routing/createApp';
import expect from 'js-abstract-synchronizer/tests/expect';
import request from 'supertest-as-promised';
import sinon from 'sinon';

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
    app: createApp({ serializer }),
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
    const { app, serializer } = createTestApp();
    const object = serializer.create(new Person({ name: 'Bob', surname: 'Boo' }));
    const data = object.getSerializedCurrentData();

    return request(app)
      .post('/object')
      .send(JSON.parse(data))
      .then(({ body }) => request(app)
        .get(`/object/${body.id}`)
        .expect(HTTPStatus.OK)
        .expect(({ body: reloadBody }) => expect(reloadBody).to.deep.equal(JSON.parse(data))));
  });

  it('runs middlewares', () => {
    const serializer = new Serializer({
      prototypes: {
        Person: Person.prototype,
      },
      serializerImplementation: new InMemorySerializer(),
    });

    const firstCallback = sinon.stub();
    const secondCallback = sinon.stub();

    const app = createApp({
      middlewares: [
        (req, res, next) => {
          firstCallback();
          next();
        },
        (req, res, next) => {
          secondCallback();
          next();
        },
      ],
      serializer,
    });

    expect(firstCallback).to.not.be.called();
    expect(secondCallback).to.not.be.called();

    return request(app)
      .post('/object')
      .then(() => {
        expect(firstCallback).to.be.called();
        expect(secondCallback).to.be.called();
      });
  });
});
