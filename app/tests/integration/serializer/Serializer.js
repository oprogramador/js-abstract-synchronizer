import ExtendableError from 'es6-error';
import InMemorySerializer from
  'js-abstract-synchronizer/tests/integration/serializer/helpers/InMemorySerializer';
import InvalidIdError from 'js-abstract-synchronizer/errors/InvalidIdError';
import Serializer from 'js-abstract-synchronizer/serializer/Serializer';
import _ from 'lodash';
import expect from 'js-abstract-synchronizer/tests/expect';
import runSerializerBasicTests from
  'js-abstract-synchronizer/tests/integration/serializer/helpers/runSerializerBasicTests';
import sinon from 'sinon';

describe('Serializer', () => {
  runSerializerBasicTests(() => new InMemorySerializer());

  it('throws InvalidIdError when provided id is not a string', () => {
    class Person {
      constructor() {
        this.id = 123;
        this.name = 'Alicia';
      }
    }
    const serializer = new Serializer({
      prototypes: {
        Person: Person.prototype,
      },
      serializerImplementation: new InMemorySerializer(),
    });
    expect(() => serializer.create(new Person())).to.throw(InvalidIdError, 'id must be a string');
  });

  it('throws InvalidIdError when provided id is an empty string', () => {
    class Person {
      constructor() {
        this.id = '';
        this.name = 'Alicia';
      }
    }
    const serializer = new Serializer({
      prototypes: {
        Person: Person.prototype,
      },
      serializerImplementation: new InMemorySerializer(),
    });
    expect(() => serializer.create(new Person())).to.throw(InvalidIdError, 'id cannot be empty');
  });

  describe('#configure', () => {
    it('calls serializerImplementation#configure with parameter', () => {
      class Person {
      }
      const customSerializer = {
        configure: sinon.stub(),
      };
      const serializer = new Serializer({
        prototypes: {
          Person: Person.prototype,
        },
        serializerImplementation: customSerializer,
      });
      const dbName = 'foo-bar';
      serializer.configure(dbName);

      expect(customSerializer.configure.withArgs(dbName)).to.be.calledOnce();
    });
  });

  describe('#create', () => {
    describe('validation', () => {
      it('runs `validate` method when it is provided', () => {
        const innerValidate = sinon.stub();
        class Person {
          constructor({ name }) {
            this.name = name;
          }
          getName() {
            return this.name;
          }
          validate(data) {
            innerValidate(data);
          }
        }
        const serializer = new Serializer({
          prototypes: {
            Person: Person.prototype,
          },
          serializerImplementation: new InMemorySerializer(),
        });
        const data = { name: 'Alicia' };
        const object = new Person(data);
        serializer.create(object);
        expect(innerValidate.withArgs(data)).to.be.calledOnce();
      });

      it('throws the same error when validation fails', () => {
        class CustomError extends ExtendableError {
        }
        class Person {
          constructor({ name }) {
            this.name = name;
          }
          getName() {
            return this.name;
          }
          validate() {
            throw new CustomError();
          }
        }
        const serializer = new Serializer({
          prototypes: {
            Person: Person.prototype,
          },
          serializerImplementation: new InMemorySerializer(),
        });
        const object = new Person({ name: 'Alicia' });
        expect(() => serializer.create(object)).to.throw(CustomError);
      });

      it('does not throw error when validation succeeds', () => {
        class Person {
          constructor({ name }) {
            this.name = name;
          }
          getName() {
            return this.name;
          }
          validate() {
          }
        }
        const serializer = new Serializer({
          prototypes: {
            Person: Person.prototype,
          },
          serializerImplementation: new InMemorySerializer(),
        });
        const object = new Person({ name: 'Alicia' });
        expect(() => serializer.createFromSerializedData(object)).to.not.throw(Error);
      });
    });
  });

  describe('#createFromSerializedData', () => {
    it('uses prototype methods in clone', () => {
      class Person {
        addFriend(person) {
          this.friends.push(person);
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
      const alicia = serializer.createFromSerializedData({
        data: {
          friends: [],
          name: 'Alicia',
        },
        prototypeName: 'Person',
      });
      const bob = serializer.createFromSerializedData({
        data: {
          friends: [],
          name: 'Bob',
        },
        prototypeName: 'Person',
      });
      const chris = serializer.createFromSerializedData({
        data: {
          friends: [],
          name: 'Chris',
        },
        prototypeName: 'Person',
      });
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

    describe('validation', () => {
      it('runs `validate` method when it is provided', () => {
        const innerValidate = sinon.stub();
        class Person {
          getName() {
            return this.name;
          }
          validate(data) {
            innerValidate(data);
          }
        }
        const serializer = new Serializer({
          prototypes: {
            Person: Person.prototype,
          },
          serializerImplementation: new InMemorySerializer(),
        });
        const data = {
          data: {
            friends: [],
            id: 'foo',
            name: 'Alicia',
          },
          prototypeName: 'Person',
        };
        serializer.createFromSerializedData(data);
        expect(innerValidate.withArgs(data.data)).to.be.calledOnce();
      });

      it('throws the same error when validation fails', () => {
        class CustomError extends ExtendableError {
        }
        class Person {
          getName() {
            return this.name;
          }
          validate() {
            throw new CustomError();
          }
        }
        const serializer = new Serializer({
          prototypes: {
            Person: Person.prototype,
          },
          serializerImplementation: new InMemorySerializer(),
        });
        const data = {
          data: {
            friends: [],
            id: 'foo',
            name: 'Alicia',
          },
          prototypeName: 'Person',
        };
        expect(() => serializer.createFromSerializedData(data)).to.throw(CustomError);
      });

      it('does not throw error when validation succeeds', () => {
        class Person {
          getName() {
            return this.name;
          }
          validate() {
          }
        }
        const serializer = new Serializer({
          prototypes: {
            Person: Person.prototype,
          },
          serializerImplementation: new InMemorySerializer(),
        });
        const data = {
          data: {
            friends: [],
            id: 'foo',
            name: 'Alicia',
          },
          prototypeName: 'Person',
        };
        expect(() => serializer.createFromSerializedData(data)).to.not.throw(Error);
      });
    });

    it('uses provided id when it is provided', () => {
      class Person {
      }
      const serializer = new Serializer({
        prototypes: {
          Person: Person.prototype,
        },
        serializerImplementation: new InMemorySerializer(),
      });
      const alicia = serializer.createFromSerializedData({
        data: {
          name: 'Alicia',
        },
        id: 'a',
        prototypeName: 'Person',
      });
      const bob = serializer.createFromSerializedData({
        data: {
          name: 'Bob',
        },
        id: 'b',
        prototypeName: 'Person',
      });
      const chris = serializer.createFromSerializedData({
        data: {
          name: 'Chris',
        },
        prototypeName: 'Person',
      });
      const dave = serializer.createFromSerializedData({
        data: {
          name: 'Dave',
        },
        prototypeName: 'Person',
      });

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
  });

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

    return alicia.save()
      .then(() => dave.setName('Dave234'))
      .then(() => expect(dave.getName()).to.equal('Dave234'))
      .then(() => dave.reload())
      .then(() => expect(dave.getName()).to.equal('Dave'));
  });

  it('saves references to referenced objects', () => {
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
      getFriends() {
        return this.friends;
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

    let friendsId;

    return alicia.save()
      .then(() => {
        const data = JSON.parse(alicia.getSerializedStoredData());
        friendsId = data.data.friends.id;
      })
      .then(() => alicia.getFriends().reload())
      .then(() => expect(alicia.getFriends().getId()).to.equal(friendsId))
      .then(() => bob.reload())
      .then(() => chris.reload())
      .then(() => {
        const data = JSON.parse(alicia.getFriends().getSerializedCurrentData());
        expect(data.data[0].id).to.equal(bob.getId());
        expect(data.data[1].id).to.equal(chris.getId());
      });
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

  it('deals with circular references - getSerializedCurrentData', () => {
    class Message {
      constructor({ room, sender, text }) {
        this.room = room;
        this.sender = sender;
        this.text = text;
        this.createdAt = Date.now();

        room.addMessage(this);
      }
      getText() {
        return this.text;
      }
      getSender() {
        return this.sender;
      }
      getCreatedAt() {
        return this.createdAt;
      }
      getRoom() {
        return this.room;
      }
    }

    class Room {
      constructor({ name }) {
        this.name = name;
        this.users = [];
        this.messages = [];
      }
      getName() {
        return this.name;
      }
      addUser(user) {
        this.users.push(user);
      }
      addMessage(message) {
        this.messages.push(message);
      }
      getUsers() {
        return _.clone(this.users);
      }
      getMessages() {
        return _.clone(this.messages);
      }
    }

    class User {
      constructor({ username }) {
        this.username = username;
      }
      getUsername() {
        return this.username;
      }
    }

    const serializer = new Serializer({
      prototypes: {
        Array: Array.prototype,
        Message: Message.prototype,
        Room: Room.prototype,
        User: User.prototype,
      },
      serializerImplementation: new InMemorySerializer(),
    });

    const user = serializer.create(new User({ username: 'Alicia' }));
    const room = serializer.create(new Room({ name: 'general' }));
    const message = serializer.create(new Message({
      room,
      sender: user,
      text: 'lorem ipsum',
    }));

    const messageData = JSON.parse(message.getSerializedCurrentData());
    expect(messageData).to.have.containSubset({
      data: {
        createdAt: message.getCreatedAt(),
        text: 'lorem ipsum',
      },
      id: message.getId(),
      prototypeName: 'Message',
    });

    const roomData = JSON.parse(room.getSerializedCurrentData());
    expect(roomData).to.have.to.containSubset({
      data: {
        name: 'general',
      },
      id: room.getId(),
      prototypeName: 'Room',
    });

    const userData = JSON.parse(user.getSerializedCurrentData());
    expect(userData).to.have.to.containSubset({
      data: {
        username: 'Alicia',
      },
      id: user.getId(),
      prototypeName: 'User',
    });
  });

  it.skip('deals with circular references - multiple classes', () => {
    class Message {
      constructor({ room, sender, text }) {
        this.room = room;
        this.sender = sender;
        this.text = text;
        this.createdAt = Date.now();

        room.addMessage(this);
      }
      getText() {
        return this.text;
      }
      getSender() {
        return this.sender;
      }
      getCreatedAt() {
        return this.createdAt;
      }
      getRoom() {
        return this.room;
      }
    }

    class Room {
      constructor({ name }) {
        this.name = name;
        this.users = [];
        this.messages = [];
      }
      getName() {
        return this.name;
      }
      addUser(user) {
        this.users.push(user);
      }
      addMessage(message) {
        this.messages.push(message);
      }
      getUsers() {
        return this.users;
      }
      getMessages() {
        return this.messages;
      }
    }

    class User {
      constructor({ username }) {
        this.username = username;
      }
      getUsername() {
        return this.username;
      }
    }

    const serializer = new Serializer({
      prototypes: {
        Array: Array.prototype,
        Message: Message.prototype,
        Room: Room.prototype,
        User: User.prototype,
      },
      serializerImplementation: new InMemorySerializer(),
    });

    const user = serializer.create(new User({ username: 'Alicia' }));
    const room = serializer.create(new Room({ name: 'general' }));
    const message = serializer.create(new Message({
      room,
      sender: user,
      text: 'lorem ipsum',
    }));

    const newUser = serializer.create({ id: user.getId() });
    const newRoom = serializer.create({ id: room.getId() });

    return message.save()
      .then(() => newUser.reload())
      .then(() => {
        expect(newUser.getUsername()).to.equal('Alicia');
      })
      .then(() => newRoom.reload())
      .then(() => {
        expect(newRoom.getName()).to.equal('general');
      })
      .then(() => newRoom.getMessages().reload())
      .then(() => newRoom.getMessages().get(0).reload())
      .then(() => {
        expect(newRoom.getMessages().get(0).getId()).to.equal(message.getId());
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
