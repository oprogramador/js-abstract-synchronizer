import ArangoSerializer from 'js-abstract-synchronizer/serializer/ArangoSerializer';
import HttpSerializer from 'js-abstract-synchronizer/serializer/HttpSerializer';
import NotFoundError from 'js-abstract-synchronizer/errors/NotFoundError';
import SerializerFactory from 'js-abstract-synchronizer/serializer/SerializerFactory';
import expect from 'js-abstract-synchronizer/tests/expect';

describe('SerializerFactory', () => {
  describe('#create', () => {
    it('creates ArangoSerializer', () => {
      const serializer = SerializerFactory.create('ArangoSerializer');

      expect(serializer).to.equal(ArangoSerializer);
    });

    it('creates HttpSerializer', () => {
      const serializer = SerializerFactory.create('HttpSerializer');

      expect(serializer).to.equal(HttpSerializer);
    });

    it('throws NotFoundError for non-existing serializer', () => {
      expect(() => SerializerFactory.create('non-existing')).to.throw(NotFoundError);
    });
  });
});
