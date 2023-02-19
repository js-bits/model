import DataType from './data-type.js';
import Model from './model.js';
import Schema from './schema.js';

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
      expect(instance instanceof DerivedModel).toBe(true);
      expect(instance instanceof Model).toBe(true);
      expect(`${DerivedModel}`).toEqual('[class Model]');
      expect(`${instance}`).toEqual('[object Model]');
    });

    describe('invalid schema', () => {
      test('empty schema', () => {
        expect.assertions(3);
        try {
          new Model({});
        } catch (error) {
          expect(error.message).toEqual('Model schema is empty');
          expect(error.name).toEqual(Schema.InvalidModelSchemaError);
          expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        }
      });
      test('wrong object type', () => {
        expect.assertions(3);
        try {
          new Model(new Date());
        } catch (error) {
          expect(error.message).toEqual('Model schema is invalid');
          expect(error.name).toEqual(Schema.InvalidModelSchemaError);
          expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        }
      });
      test('wrong schema parameter', () => {
        expect.assertions(3);
        try {
          new Model({
            func: () => {},
          });
        } catch (error) {
          expect(error.message).toEqual('Model schema is invalid: data type of "func" property is invalid');
          expect(error.name).toEqual(Schema.InvalidModelSchemaError);
          expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        }
      });
    });

    test('data type', () => {
      const MyModel = new Model({
        string: String,
      });
      const instance = new MyModel({ string: '' });
      expect(DataType.is(Model, instance)).toBe(true);
      expect(DataType.validate(Model, MyModel)).toEqual('must be a model');
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
          }).toThrowError('Data is invalid');
        });
      });
    });
  });

  describe('specifiers', () => {
    test('! specifier', () => {
      const MyModel = new Model({
        string: String,
        date: Date,
        'required!': Boolean,
        'number!': Number,
      });
      expect(MyModel.validate({})).toEqual({
        required: 'required property is not defined',
        number: 'required property is not defined',
      });
    });
    test('? specifier', () => {
      const MyModel = new Model({
        string: String,
        date: Date,
        'optional?': Boolean,
        'number?': Number,
      });
      expect(MyModel.validate({})).toEqual({
        string: 'required property is not defined',
        date: 'required property is not defined',
      });
    });
    test('illegal usage of both ! and ?', () => {
      expect(() => {
        const MyModel = new Model({
          string: String,
          date: Date,
          'optional?': Boolean,
          'required!': true,
        });
      }).toThrow('Model schema is invalid. Must contain either ? or ! specifiers');
    });
  });

  describe('.validate', () => {
    const DerivedModel = new Model({
      string: String,
      number: Number,
      boolean: Boolean,
      date: Date,
      'optional?': String,
    });

    test('incorrect data', () => {
      expect(DerivedModel.validate('')).toEqual('invalid model type');
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
      ).toEqual({
        string: 'must be a string',
        number: 'must be a number',
        boolean: 'must be a boolean',
        date: 'must be a date',
        optional: 'must be a string',
      });
    });
  });

  describe('.isModel', () => {
    const MyModel = new Model({
      string: String,
    });

    test('should return true for models', () => {
      expect(Model.isModel(MyModel)).toBe(true);
    });

    test('should return false otherwise', () => {
      expect(Model.isModel(Model)).toBe(false);
      expect(Model.isModel(Function)).toBe(false);
      expect(Model.isModel()).toBe(false);
    });
  });

  describe('Model.SAME', () => {
    test('should return true for models', () => {
      expect(DataType.validate(Model.SAME, '')).toEqual('Model.SAME must not be use directly');
    });
  });
});
