import NotFoundError from 'js-abstract-synchronizer/errors/NotFoundError';
import Serializer from 'js-abstract-synchronizer/serializer/Serializer';
import expect from 'js-abstract-synchronizer/tests/expect';
import faker from 'faker';

export default (serializerImplementationClass) => {
  beforeEach('recreate database', () => {
    const newDatabaseName = `test-${faker.random.uuid()}`;

    return new serializerImplementationClass().configure(newDatabaseName);
  });

  describe('#getSerializedStoredData', () => {
    it('returns proper data', () => {
      class Person {
        constructor() {
          this.name = 'John';
          this.surname = 'Smith';
        }
      }
      const serializer = new Serializer({
        prototypes: {
          Person: Person.prototype,
        },
        serializerImplementation: new serializerImplementationClass(),
      });
      const object = new Person();
      const serializableObject = serializer.create(object);

      expect(JSON.parse(serializableObject.getSerializedStoredData())).to.be.null();

      const expectedData = {
        data: {
          name: 'John',
          surname: 'Smith',
        },
        id: serializableObject.getId(),
        prototypeName: 'Person',
      };

      return serializableObject.save()
        .then(() => expect(JSON.parse(serializableObject.getSerializedStoredData())).to.deep.equal(expectedData))
        .then(() => serializableObject.reload())
        .then(() => expect(JSON.parse(serializableObject.getSerializedStoredData())).to.deep.equal(expectedData));
    });
  });

  describe('#getSerializedCurrentData', () => {
    it('returns proper data', () => {
      class Person {
        constructor() {
          this.name = 'John';
          this.surname = 'Smith';
        }
      }
      const serializer = new Serializer({
        prototypes: {
          Person: Person.prototype,
        },
        serializerImplementation: new serializerImplementationClass(),
      });
      const object = new Person();
      const serializableObject = serializer.create(object);

      const expectedData = {
        data: {
          name: 'John',
          surname: 'Smith',
        },
        id: serializableObject.getId(),
        prototypeName: 'Person',
      };

      expect(JSON.parse(serializableObject.getSerializedCurrentData())).to.deep.equal(expectedData);

      return serializableObject.save()
        .then(() => expect(JSON.parse(serializableObject.getSerializedCurrentData())).to.deep.equal(expectedData))
        .then(() => serializableObject.reload())
        .then(() => expect(JSON.parse(serializableObject.getSerializedCurrentData())).to.deep.equal(expectedData));
    });
  });

  describe('#reload', () => {
    it('rejects when object is not found', () => {
      const serializer = new Serializer({
        prototypes: {},
        serializerImplementation: new serializerImplementationClass(),
      });

      const serializableObject = serializer.create({ id: 'non-existent' });

      return expect(serializableObject.reload()).to.be.rejectedWith(NotFoundError);
    });
  });

  it('saves and reloads object', () => {
    class Person {
      constructor() {
        this.name = 'John';
        this.surname = 'Smith';
      }
      getName() {
        return this.name;
      }
      getSurname() {
        return this.surname;
      }
    }
    const serializer = new Serializer({
      prototypes: {
        Person: Person.prototype,
      },
      serializerImplementation: new serializerImplementationClass(),
    });
    const object = new Person();
    const serializableObject = serializer.create(object);

    return serializableObject.save()
      .then(() => serializableObject.reload())
      .then(() => {
        expect(serializableObject.getId()).to.be.a('string');
        expect(serializableObject.getName()).to.equal('John');
        expect(serializableObject.getSurname()).to.equal('Smith');
      });
  });

  it('reloads object when someone else has changed it', () => {
    class Person {
      constructor() {
        this.id = 'foo';
        this.name = 'John';
        this.surname = 'Smith';
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
    }
    const serializer = new Serializer({
      prototypes: {
        Person: Person.prototype,
      },
      serializerImplementation: new serializerImplementationClass(),
    });
    const object = new Person();

    const serializableObject = serializer.create(object);
    const anotherSerializableObject = serializer.create(object);

    return serializableObject.save()
      .then(() => {
        anotherSerializableObject.setName('Vanessa');

        return anotherSerializableObject.save();
      })
      .then(() => serializableObject.reload())
      .then(() => {
        expect(serializableObject.getId()).to.equal('foo');
        expect(serializableObject.getName()).to.equal('Vanessa');
        expect(serializableObject.getSurname()).to.equal('Smith');
      });
  });
};
