import DataType from '../data-type/data-type.js';
import Model from './model.js';
import Schema from './schema.js';

describe('Schema', () => {
  describe('invalid schema', () => {
    test('empty schema', () => {
      expect.assertions(4);
      try {
        new Model({});
      } catch (error) {
        expect(error.message).toEqual('Model schema is empty');
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeUndefined();
      }
    });
    test('wrong object type', () => {
      expect.assertions(4);
      try {
        new Model(new Date());
      } catch (error) {
        expect(error.message).toEqual('Model schema is invalid');
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeUndefined();
      }
    });
    test('wrong schema parameter', () => {
      expect.assertions(7);
      try {
        new Model({
          func: () => {},
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Model schema is invalid: "func" property is invalid (see "error.cause" for details)'
        );
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeDefined();
        expect(error.cause.message).toEqual('Unknown data type');
        expect(error.cause.name).toEqual(DataType.ValidationError);
        expect(error.cause.cause).toBeUndefined();
      }
    });
    test('illegal usage of both ! and ?', () => {
      expect.assertions(4);
      try {
        const MyModel = new Model({
          string: String,
          date: Date,
          'optional?': Boolean,
          'required!': true,
        });
      } catch (error) {
        expect(error.message).toEqual('Model schema is invalid: must contain either ? or ! specifiers');
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeUndefined();
      }
    });
  });

  describe('invalid sub-schema', () => {
    test('empty schema', () => {
      expect.assertions(7);
      try {
        new Model({
          subModel: {},
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Model schema is invalid: "subModel" property is invalid (see "error.cause" for details)'
        );
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeDefined();
        expect(error.cause.message).toEqual('Model schema is empty');
        expect(error.cause.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.cause.cause).toBeUndefined();
      }
    });
    test('wrong object type', () => {
      expect.assertions(7);
      try {
        new Model({ subModel: new Date() });
      } catch (error) {
        expect(error.message).toEqual(
          'Model schema is invalid: "subModel" property is invalid (see "error.cause" for details)'
        );
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeDefined();
        expect(error.cause.message).toEqual('Unknown data type');
        expect(error.cause.name).toEqual(DataType.ValidationError);
        expect(error.cause.cause).toBeUndefined();
      }
    });
    test('wrong schema parameter', () => {
      expect.assertions(10);
      try {
        new Model({
          subModel: {
            func: () => {},
          },
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Model schema is invalid: "subModel" property is invalid (see "error.cause" for details)'
        );
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeDefined();
        expect(error.cause.message).toEqual(
          'Model schema is invalid: "func" property is invalid (see "error.cause" for details)'
        );
        expect(error.cause.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.cause.cause).toBeDefined();
        expect(error.cause.cause.message).toEqual('Unknown data type');
        expect(error.cause.cause.name).toEqual(DataType.ValidationError);
        expect(error.cause.cause.cause).toBeUndefined();
      }
    });
    test('illegal usage of both ! and ?', () => {
      expect.assertions(7);
      try {
        const MyModel = new Model({
          subModel: {
            string: String,
            date: Date,
            'optional?': Boolean,
            'required!': true,
          },
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Model schema is invalid: "subModel" property is invalid (see "error.cause" for details)'
        );
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeDefined();
        expect(error.cause.message).toEqual('Model schema is invalid: must contain either ? or ! specifiers');
        expect(error.cause.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.cause.cause).toBeUndefined();
      }
    });
  });

  describe('constant shortcuts', () => {
    const MyModel = new Model({
      string_constant: '1234',
      number_constant: 1234,
      boolean_constant: false,
    });
    test('valid data type', () => {
      expect(() => {
        new MyModel({
          string_constant: '1234',
          number_constant: 1234,
          boolean_constant: false,
        });
      }).not.toThrow();
    });
    test('invalid data values', () => {
      expect.assertions(3);
      try {
        new MyModel({
          string_constant: '3456',
          number_constant: 3456,
          boolean_constant: true,
        });
      } catch (error) {
        expect(error.message).toEqual('Data is not valid: see "error.cause" for details');
        expect(error.cause).toEqual([
          '"string_constant" must be equal to "1234"',
          '"number_constant" must be equal to 1234',
          '"boolean_constant" must be equal to false',
        ]);
        expect(error.name).toEqual(DataType.ValidationError);
      }
    });
    test('invalid data types', () => {
      expect.assertions(3);
      try {
        new MyModel({
          string_constant: 3456,
          number_constant: true,
          boolean_constant: '3456',
        });
      } catch (error) {
        expect(error.message).toEqual('Data is not valid: see "error.cause" for details');
        expect(error.cause).toEqual([
          '"string_constant" must be a string',
          '"number_constant" must be a number',
          '"boolean_constant" must be a boolean',
        ]);
        expect(error.name).toEqual(DataType.ValidationError);
      }
    });
  });

  describe('Model shortcut', () => {
    const MyModel = new Model({
      subModel: {
        numberField: Number,
        stringField: String,
      },
    });
    test('valid data values', () => {
      expect(() => {
        new MyModel({
          subModel: {
            numberField: 123,
            stringField: 'abc',
          },
        });
      }).not.toThrow();
    });
    test('invalid data values', () => {
      expect.assertions(2);
      try {
        new MyModel({
          subModel: {
            numberField: '123',
            stringField: 123,
          },
        });
      } catch (error) {
        expect(error.message).toEqual('Data is not valid: see "error.cause" for details');
        expect(error.cause).toEqual([
          '"subModel.numberField" must be a number',
          '"subModel.stringField" must be a string',
        ]);
      }
    });
    test('invalid sub-model data', () => {
      expect.assertions(3);
      try {
        new MyModel({
          subModel: 123,
        });
      } catch (error) {
        expect(error.message).toEqual('Data is not valid: "subModel" invalid model type');
        expect(error.cause).toEqual(['"subModel" invalid model type']);
        expect(error.name).toEqual(DataType.ValidationError);
      }
    });
    test('invalid sub-data type definition', () => {
      expect.assertions(9);
      try {
        new Model({
          subModel: {
            numberField: Object,
          },
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Model schema is invalid: "subModel" property is invalid (see "error.cause" for details)'
        );
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.cause).toBeDefined();
        expect(error.cause.message).toEqual(
          'Model schema is invalid: "numberField" property is invalid (see "error.cause" for details)'
        );
        expect(error.cause.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.cause.cause).toBeDefined();
        expect(error.cause.cause.message).toEqual('Unknown data type');
        expect(error.cause.cause.name).toEqual(DataType.ValidationError);
        expect(error.cause.cause.cause).toBeUndefined();
      }
    });
    test('invalid sub-sub-data type definition', () => {
      expect.assertions(12);
      try {
        new Model({
          subModel: {
            subModel2: {
              numberField: Object,
            },
          },
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Model schema is invalid: "subModel" property is invalid (see "error.cause" for details)'
        );
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.cause).toBeDefined();
        expect(error.cause.message).toEqual(
          'Model schema is invalid: "subModel2" property is invalid (see "error.cause" for details)'
        );
        expect(error.cause.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.cause.cause).toBeDefined();
        expect(error.cause.cause.message).toEqual(
          'Model schema is invalid: "numberField" property is invalid (see "error.cause" for details)'
        );
        expect(error.cause.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.cause.cause.cause).toBeDefined();
        expect(error.cause.cause.cause.message).toEqual('Unknown data type');
        expect(error.cause.cause.cause.name).toEqual(DataType.ValidationError);
        expect(error.cause.cause.cause.cause).toBeUndefined();
      }
    });
  });
});
