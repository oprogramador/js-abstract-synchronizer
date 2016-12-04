import { SerializerFactory, createApp } from 'js-abstract-synchronizer/index';
import directCreateApp from 'js-abstract-synchronizer/routing/createApp';
import directSerializerFactory from 'js-abstract-synchronizer/serializer/SerializerFactory';
import expect from 'js-abstract-synchronizer/tests/expect';

describe('index', () => {
  it('returns SerializerFactory', () => {
    expect(SerializerFactory).to.equal(directSerializerFactory);
  });

  it('returns createApp', () => {
    expect(createApp).to.equal(directCreateApp);
  });
});
