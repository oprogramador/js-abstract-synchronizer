import ArangoSerializer from 'js-abstract-synchronizer/serializer/ArangoSerializer';
import HttpSerializer from 'js-abstract-synchronizer/serializer/HttpSerializer';
import NotFoundError from 'js-abstract-synchronizer/errors/NotFoundError';
import Serializer from 'js-abstract-synchronizer/serializer/Serializer';

const serializers = {
  ArangoSerializer,
  HttpSerializer,
};

export default {
  create({ implementationName, implementationParams, prototypes }) {
    const serializerImplementationClass = serializers[implementationName];

    if (typeof serializerImplementationClass === 'undefined') {
      throw new NotFoundError();
    }

    const serializerImplementation = new serializerImplementationClass(implementationParams);

    const serializer = new Serializer({
      prototypes,
      serializerImplementation,
    });

    return serializer;
  },
};
