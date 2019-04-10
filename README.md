# js-abstract-synchronizer

[![MIT License](https://img.shields.io/badge/license-mit-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/oprogramador/js-abstract-synchronizer.svg?branch=master)](https://travis-ci.org/oprogramador/js-abstract-synchronizer)

[![NPM status](https://nodei.co/npm/js-abstract-synchronizer.png?downloads=true&stars=true)](https://npmjs.org/package/js-abstract-synchronizer)

This library is no longer supported, please use [vinberodb](https://github.com/oprogramador/vinberodb) instead.

This library works on:

* backend like ODM or ORM
* frontend making HTTP requests to save data on the server

## install

`npm install --save js-abstract-synchronizer`

## usage

```javascript
import arangojs from 'arangojs';
import { SerializerFactory } from 'js-abstract-synchronizer';

const db = arangojs({ url: 'http//user:password@localhost:8529' });

class Person {
  constructor({ id, name, surname }) {
    this.id = id;
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
const serializer = SerializerFactory.create({
  implementationName: 'ArangoSerializer',
  implementationParams: {
    db,
  },
  prototypes: {
    Person: Person.prototype,
  },
});

const alicia = serializer.create(new Person({ name: 'alicia', surname: 'aaa', id: 'foo' }));
const newAlice = serializer.create({ id: 'foo' });

export default serializer.configure('database-name')
  .then(() => alicia.save())
  .then(() => console.log(alicia.getName()))
  .then(() => newAlice.reload())
  .then(() => console.log(newAlice.getName()))
});
```
