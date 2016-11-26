import ArangoSerializer from 'js-abstract-synchronizer/serializer/ArangoSerializer';
import HttpSerializer from 'js-abstract-synchronizer/serializer/HttpSerializer';
import NotFoundError from 'js-abstract-synchronizer/errors/NotFoundError';

const serializers = {
  ArangoSerializer,
  HttpSerializer,
};

export default {
  create(name) {
    const serializer = serializers[name];

    if (typeof serializer === 'undefined') {
      throw new NotFoundError();
    }

    return serializer;
  },
};
