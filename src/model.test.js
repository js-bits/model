import DataType from './data-type.js';
import Model from './model.js';

describe('Model', () => {
  describe('#constructor', () => {
    test('conversion to string', () => {
      expect(`${Model}`).toEqual('[class Model]');
      expect(`${new Model()}`).toEqual('[object Model]');
    });

    test('inheritance', () => {
      const DerivedModel = new Model({
        'test?': String,
      });
      const instance = new DerivedModel({});
      expect(instance).toBeInstanceOf(DerivedModel);
      expect(instance).toBeInstanceOf(Model);
      expect(`${DerivedModel}`).toEqual('[class Model]');
      expect(`${instance}`).toEqual('[object Model]');
    });

    test('invalid schema', () => {
      expect.assertions(9);
      try {
        new Model({});
      } catch (error) {
        expect(error.message).toEqual('Model schema is empty');
        expect(error.name).toEqual(Model.InvalidModelSchemaError);
        expect(error.name).toEqual('InvalidModelSchemaError');
      }
      try {
        new Model(123);
      } catch (error) {
        expect(error.message).toEqual('Model schema is invalid');
        expect(error.name).toEqual(Model.InvalidModelSchemaError);
        expect(error.name).toEqual('InvalidModelSchemaError');
      }
      try {
        new Model({
          func: () => {},
        });
      } catch (error) {
        expect(error.message).toEqual('Model schema is invalid: data type of "func" is invalid');
        expect(error.name).toEqual(Model.InvalidModelSchemaError);
        expect(error.name).toEqual('InvalidModelSchemaError');
      }
    });

    test('data type', () => {
      const MyModel = new Model({
        string: String,
      });
      const instance = new MyModel({ string: '' });
      expect(DataType.is(Model, instance)).toBeTruthy();
      expect(DataType.validate(Model, MyModel)).toEqual(['must be a model']);
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
            new DerivedModel({
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
        'Field "string": must be a string',
        'Field "number": must be a number',
        'Field "boolean": must be a boolean',
        'Field "date": must be a date',
        'Field "optional": must be a string',
      ]);
    });
  });
});
