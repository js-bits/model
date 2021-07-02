import { expect } from '@jest/globals';
import Model, { PrimitiveType } from './model.js';

describe('Model', () => {
  describe('#constructor', () => {
    test('inheritance', () => {
      const DerivedModel = new Model({});
      const instance = new DerivedModel({});
      expect(instance).toBeInstanceOf(DerivedModel);
      expect(instance).toBeInstanceOf(Model);
    });

    test('schema', () => {
      const DerivedModel = new Model({
        string: String,
        number: Number,
        boolean: Boolean,
        'optional?': String,
      });
      const instance = new DerivedModel({
        string: '',
        number: 0,
        boolean: false,
      });
      expect(instance).toBeInstanceOf(DerivedModel);
      expect(instance).toBeInstanceOf(Model);
    });
  });
});
