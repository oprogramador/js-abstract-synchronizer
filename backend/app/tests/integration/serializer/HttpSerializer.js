import HttpSerializer from 'js-abstract-synchronizer/serializer/HttpSerializer';
import runSerializerBasicTests from
  'js-abstract-synchronizer/tests/integration/serializer/helpers/runSerializerBasicTests';

const url = 'http://localhost:3000';

describe('HttpSerializer', () => {
  runSerializerBasicTests(() => new HttpSerializer({ url }));
});
