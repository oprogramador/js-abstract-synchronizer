import HttpSerializer from 'js-abstract-synchronizer/serializer/HttpSerializer';
import runSerializerBasicTests from
  'js-abstract-synchronizer/tests/integration/serializer/helpers/runSerializerBasicTests';

describe('HttpSerializer', () => {
  runSerializerBasicTests(HttpSerializer);
});
