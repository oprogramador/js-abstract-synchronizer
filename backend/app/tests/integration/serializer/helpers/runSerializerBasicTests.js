import Serializer from 'js-abstract-synchronizer/serializer/Serializer';
import expect from 'js-abstract-synchronizer/tests/expect';
import faker from 'faker';

export default (serializerImplementationClass) => {
  beforeEach('recreate database', () => {
    const newDatabaseName = `test-${faker.random.uuid()}`;

    return new serializerImplementationClass().configure(newDatabaseName);
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
