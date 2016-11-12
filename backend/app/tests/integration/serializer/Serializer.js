import Serializer from 'js-abstract-synchronizer/serializer/Serializer';
import expect from 'js-abstract-synchronizer/tests/expect';
import faker from 'faker';

describe('Serializer', () => {
  beforeEach('recreate database', () => {
    const serializer = new Serializer();
    const newDatabaseName = `test-${faker.random.uuid()}`;

    return serializer.createDatabase(newDatabaseName)
      .then(() => serializer.createCollection());
  });

  it('saves and reloads object when it is valid', () => {
    const serializer = new Serializer();
    const object = {
      getId() {
        return this.id;
      },
      getName() {
        return this.name;
      },
      getSurname() {
        return this.surname;
      },
      name: 'John',
      surname: 'Smith',
    };

    const serializableObject = serializer.create(object);

    return serializableObject.save()
      .then(() => serializableObject.reload())
      .then(() => {
        expect(serializableObject.getId()).to.be.a('string');
        expect(serializableObject.getName()).to.equal('John');
        expect(serializableObject.getSurname()).to.equal('Smith');
      });
  });

  it('resets object', () => {
    const serializer = new Serializer();
    const object = {
      getId() {
        return this.id;
      },
      getName() {
        return this.name;
      },
      getSurname() {
        return this.surname;
      },
      name: 'John',
      setName(name) {
        this.name = name;
      },
      setSurname(surname) {
        this.surname = surname;
      },
      surname: 'Smith',
    };

    const serializableObject = serializer.create(object);

    return serializableObject.save()
      .then(() => {
        serializableObject.setName('Bob');
        serializableObject.setSurname('Brown');

        expect(serializableObject.getName()).to.equal('Bob');
        expect(serializableObject.getSurname()).to.equal('Brown');
      })
      .then(() => serializableObject.reset())
      .then(() => {
        expect(serializableObject.getName()).to.equal('John');
        expect(serializableObject.getSurname()).to.equal('Smith');
      })
      .then(() => {
        serializableObject.setName('Tom');
        serializableObject.setSurname('Johnson');

        expect(serializableObject.getName()).to.equal('Tom');
        expect(serializableObject.getSurname()).to.equal('Johnson');
      })
      .then(() => serializableObject.reset())
      .then(() => {
        expect(serializableObject.getName()).to.equal('John');
        expect(serializableObject.getSurname()).to.equal('Smith');
      });
  });

  it('reloads object when someone else has changed it', () => {
    const serializer = new Serializer();
    const object = {
      getId() {
        return this.id;
      },
      getName() {
        return this.name;
      },
      getSurname() {
        return this.surname;
      },
      id: 'foo',
      name: 'John',
      setName(name) {
        this.name = name;
      },
      surname: 'Smith',
    };

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

  it('requires security token');
});
