import ArangoSerializer from 'js-abstract-synchronizer/serializer/ArangoSerializer';
import runSerializerBasicTests from 'js-abstract-synchronizer/tests/integration/serializer/runSerializerBasicTests';

describe('ArangoSerializer', () => {
  runSerializerBasicTests(ArangoSerializer);
});
