import Model, { PrimitiveType } from './model.js';

describe('Model', () => {
  describe('#constructor', () => {
    test('inheritance', () => {
      const DerivedModel = new Model({
        'test?': String,
      });
      const instance = new DerivedModel({});
      expect(instance).toBeInstanceOf(DerivedModel);
      expect(instance).toBeInstanceOf(Model);
    });

    test('invalid schema', () => {
      expect(() => {
        new Model({});
      }).toThrowError('Empty model schema');
      expect(() => {
        new Model(123);
      }).toThrowError('Invalid model schema');
      expect(() => {
        const DerivedModel = new Model({
          func: () => {},
        });
      }).toThrowError('Invalid data schema: unknown data type for "func"');
    });

    describe('built-in types', () => {
      describe('multiple fields', () => {
        const DerivedModel = new Model({
          string: String,
          number: Number,
          boolean: Boolean,
          date: Date,
          'optional?': String,
        });

        test('correct values', () => {
          const instance = new DerivedModel({
            string: '',
            number: 0,
            date: new Date(),
            boolean: false,
          });
          expect(instance).toBeInstanceOf(DerivedModel);
          expect(instance).toBeInstanceOf(Model);
        });

        test('incorrect values', () => {
          expect(() => {
            const instance = new DerivedModel({
              string: 123,
              number: '',
              date: false,
              boolean: new Date(),
              optional: 234,
            });
          }).toThrowError('Invalid data');
        });
      });
    });
  });

  describe('#validate', () => {
    const DerivedModel = new Model({
      string: String,
      number: Number,
      boolean: Boolean,
      date: Date,
      'optional?': String,
    });

    test('incorrect values', () => {
      expect(
        DerivedModel.validate({
          string: 123,
          number: '',
          date: false,
          boolean: new Date(),
          optional: 234,
        })
      ).toEqual([
        'Field "string": Invalid value',
        'Field "number": Invalid value',
        'Field "boolean": Invalid value',
        'Field "date": Invalid value',
        'Field "optional": Invalid value',
      ]);
    });
  });
});
