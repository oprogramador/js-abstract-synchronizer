import ArangoSerializer from 'js-abstract-synchronizer/serializer/ArangoSerializer';
import { db } from 'js-abstract-synchronizer/servicesManager';
import runSerializerBasicTests from
  'js-abstract-synchronizer/tests/integration/serializer/helpers/runSerializerBasicTests';

describe('ArangoSerializer', () => {
  runSerializerBasicTests(() => new ArangoSerializer({ db }));
});
