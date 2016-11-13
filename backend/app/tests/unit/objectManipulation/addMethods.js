import _ from 'lodash';
import addMethods from 'js-abstract-synchronizer/objectManipulation/addMethods';
import expect from 'js-abstract-synchronizer/tests/expect';

describe('addMethods', () => {
  it('adds methods from prototype', () => {
    class Person {
      constructor() {
        this.age = 0;
      }

      older() {
        this.age++;

        return this;
      }
    }

    const innerObject = new Person();
    const person = {
      innerObject: _.cloneDeep(innerObject),
    };

    addMethods({ getTargetInnerObject: () => person.innerObject, source: innerObject, target: person });
    person.older().older();

    expect(person.innerObject).to.have.property('age', 2);
  });

  it('adds methods from object', () => {
    const innerObject = {
      age: 0,

      older() {
        this.age++;

        return this;
      },
    };
    const person = {
      innerObject: _.cloneDeep(innerObject),
    };

    addMethods({ getTargetInnerObject: () => person.innerObject, source: innerObject, target: person });
    person.older().older();

    expect(person.innerObject).to.have.property('age', 2);
  });

  it('applies all passed parameters', () => {
    const innerObject = {
      addNotes(maths, physics, biology) {
        this.notes.maths.push(maths);
        this.notes.physics.push(physics);
        this.notes.biology.push(biology);

        return this;
      },

      notes: {
        biology: [3],
        maths: [2],
        physics: [4],
      },
    };
    const student = {
      innerObject: _.cloneDeep(innerObject),
    };

    addMethods({ getTargetInnerObject: () => student.innerObject, source: innerObject, target: student });
    student
      .addNotes(2, 2, 6)
      .addNotes(3, 1, 4);

    expect(student.innerObject.notes).to.deep.equal({
      biology: [3, 6, 4],
      maths: [2, 2, 3],
      physics: [4, 2, 1],
    });
  });

  it('adds \'get\' method for Array', () => {
    const innerObject = ['foo', 'bar', 'baz'];
    const list = {
      innerObject: _.cloneDeep(innerObject),
    };

    addMethods({ getTargetInnerObject: () => list.innerObject, source: innerObject, target: list });

    expect(list.get(0)).to.equal('foo');
    expect(list.get(1)).to.equal('bar');
    expect(list.get(2)).to.equal('baz');
  });

  it('adds \'set\' method for Array', () => {
    const innerObject = ['foo', 'bar', 'baz'];
    const list = {
      innerObject: _.cloneDeep(innerObject),
    };

    addMethods({ getTargetInnerObject: () => list.innerObject, source: innerObject, target: list });

    list.set(0, 'foo2');
    list.set(1, 'bar2');

    expect(list.get(0)).to.equal('foo2');
    expect(list.get(1)).to.equal('bar2');
    expect(list.get(2)).to.equal('baz');
  });

  it('adds no extra properties', () => {
    const innerObject = {
      age: 0,

      older() {
        this.age++;

        return this;
      },
    };
    const person = {
      innerObject: _.cloneDeep(innerObject),
    };

    addMethods({ getTargetInnerObject: () => person.innerObject, source: innerObject, target: person });
    person.older().older();

    expect(person).to.have.keys('older', 'innerObject');
  });
});
