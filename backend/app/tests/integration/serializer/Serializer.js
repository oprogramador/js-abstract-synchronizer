import InMemorySerializer from
  'js-abstract-synchronizer/tests/integration/serializer/helpers/InMemorySerializer';
import Serializer from 'js-abstract-synchronizer/serializer/Serializer';
import expect from 'js-abstract-synchronizer/tests/expect';
import runSerializerBasicTests from
  'js-abstract-synchronizer/tests/integration/serializer/helpers/runSerializerBasicTests';

describe('Serializer', () => {
  runSerializerBasicTests(InMemorySerializer);

  it('returns no extra fields');
  it('rejects with unique containt validation error when id repeats');

  it('uses provided id when it is provided', () => {
    class Person {
      constructor({ id, name }) {
        this.id = id;
        this.name = name;
      }
    }
    const serializer = new Serializer({
      prototypes: {
        Person: Person.prototype,
      },
      serializerImplementation: new InMemorySerializer(),
    });
    const alicia = serializer.create(new Person({ id: 'a', name: 'Alicia' }));
    const bob = serializer.create(new Person({ id: 'b', name: 'Bob' }));
    const chris = serializer.create(new Person({ name: 'Chris' }));
    const dave = serializer.create(new Person({ name: 'Dave' }));

    expect(alicia.getId()).to.equal('a');
    expect(bob.getId()).to.equal('b');
    expect(chris.getId()).to.be.a('string');
    expect(dave.getId()).to.be.a('string');

    return alicia.save()
      .then(() => {
        expect(alicia.getId()).to.equal('a');
        expect(bob.getId()).to.equal('b');
        expect(chris.getId()).to.be.a('string');
        expect(dave.getId()).to.be.a('string');
      });
  });

  it('works with with \'configure\' calling multiple times');

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
        serializerImplementation: new InMemorySerializer(),
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
        serializerImplementation: new InMemorySerializer(),
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

  it('saves referenced objects', () => {
    class Person {
      addFriend(person) {
        this.friends.push(person);
      }
      constructor(name) {
        this.name = name;
        this.friends = [];
      }
      getName() {
        return this.name;
      }
      setName(name) {
        this.name = name;
      }
    }
    const serializer = new Serializer({
      prototypes: {
        Person: Person.prototype,
      },
      serializerImplementation: new InMemorySerializer(),
    });
    const alicia = serializer.create(new Person('Alicia'));
    const bob = serializer.create(new Person('Bob'));
    const chris = serializer.create(new Person('Chris'));
    const dave = serializer.create(new Person('Dave'));
    alicia.addFriend(bob);
    alicia.addFriend(chris);
    chris.addFriend(dave);

    return alicia.save()
      .then(() => dave.setName('Dave234'))
      .then(() => expect(dave.getName()).to.equal('Dave234'))
      .then(() => dave.reload())
      .then(() => expect(dave.getName()).to.equal('Dave'));
  });

  it('makes correct references', () => {
    class Person {
      addFriend(person) {
        this.friends.push(person);
      }
      constructor(name) {
        this.name = name;
        this.friends = [];
      }
      getFriends() {
        return this.friends;
      }
      getName() {
        return this.name;
      }
    }
    const serializer = new Serializer({
      prototypes: {
        Array: Array.prototype,
        Person: Person.prototype,
      },
      serializerImplementation: new InMemorySerializer(),
    });
    const alicia = serializer.create(new Person('Alicia'));
    const bob = serializer.create(new Person('Bob'));
    const chris = serializer.create(new Person('Chris'));
    alicia.addFriend(bob);
    alicia.addFriend(chris);

    return alicia.save()
      .then(() => alicia.reload())
      .then(() => {
        expect(alicia.getFriends().get(0).getName()).to.equal('Bob');
        expect(alicia.getFriends().get(1).getName()).to.equal('Chris');
      });
  });

  it('uses prototype methods in clone', () => {
    class Person {
      addFriend(person) {
        this.friends.push(person);
      }
      constructor(name) {
        this.name = name;
        this.friends = [];
      }
      getFriends() {
        return this.friends;
      }
      getName() {
        return this.name;
      }
    }
    const serializer = new Serializer({
      prototypes: {
        Array: Array.prototype,
        Person: Person.prototype,
      },
      serializerImplementation: new InMemorySerializer(),
    });
    const alicia = serializer.create(new Person('Alicia'));
    const bob = serializer.create(new Person('Bob'));
    const chris = serializer.create(new Person('Chris'));
    alicia.addFriend(bob);
    alicia.addFriend(chris);
    let newAlicia;

    return alicia.save()
      .then(() => {
        newAlicia = serializer.create({ id: alicia.getId() });
      })
      .then(() => newAlicia.reload())
      .then(() => newAlicia.getFriends().reload())
      .then(() => newAlicia.getFriends().get(0).reload())
      .then(() => newAlicia.getFriends().get(1).reload())
      .then(() => {
        expect(newAlicia.getFriends().get(0).getName()).to.equal('Bob');
        expect(newAlicia.getFriends().get(1).getName()).to.equal('Chris');
      });
  });

  it('deals with circular references', () => {
    class Person {
      addFriend(person) {
        this.friends.push(person);
      }
      constructor(name) {
        this.name = name;
        this.friends = [];
      }
      getName() {
        return this.name;
      }
      setName(name) {
        this.name = name;
      }
    }
    const serializer = new Serializer({
      prototypes: {
        Array: Array.prototype,
        Person: Person.prototype,
      },
      serializerImplementation: new InMemorySerializer(),
    });
    const alicia = serializer.create(new Person('Alicia'));
    const bob = serializer.create(new Person('Bob'));
    const chris = serializer.create(new Person('Chris'));
    const dave = serializer.create(new Person('Dave'));
    alicia.addFriend(bob);
    alicia.addFriend(chris);
    chris.addFriend(dave);
    dave.addFriend(alicia);

    return alicia.save()
      .then(() => dave.setName('Dave234'))
      .then(() => expect(dave.getName()).to.equal('Dave234'))
      .then(() => dave.reload())
      .then(() => expect(dave.getName()).to.equal('Dave'));
  });

  it('resets object', () => {
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
      setName(name) {
        this.name = name;
      }
      setSurname(surname) {
        this.surname = surname;
      }
    }
    const serializer = new Serializer({
      prototypes: {
        Person: Person.prototype,
      },
      serializerImplementation: new InMemorySerializer(),
    });
    const object = new Person();

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

  describe('#isDirty', () => {
    it('returns true when it has some unstored modifications and false otherwise', () => {
      class Person {
        constructor() {
          this.name = 'John';
        }
        getName() {
          return this.name;
        }
        setName(name) {
          this.name = name;
        }
      }
      const serializer = new Serializer({
        prototypes: {
          Person: Person.prototype,
        },
        serializerImplementation: new InMemorySerializer(),
      });
      const object = new Person();
      const serializableObject = serializer.create(object);

      expect(serializableObject.isDirty()).to.be.true();

      return serializableObject.save()
        .then(() => expect(serializableObject.isDirty()).to.be.false())
        .then(() => serializableObject.setName('Bob'))
        .then(() => expect(serializableObject.isDirty()).to.be.true())
        .then(() => serializableObject.reset())
        .then(() => expect(serializableObject.isDirty()).to.be.false())
        .then(() => serializableObject.setName('Bob'))
        .then(() => expect(serializableObject.isDirty()).to.be.true())
        .then(() => serializableObject.save())
        .then(() => expect(serializableObject.isDirty()).to.be.false());
    });
  });

  it('requires security token');
});
