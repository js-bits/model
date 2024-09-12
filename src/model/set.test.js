import DataType from '../data-type/data-type.js';
import Model from './model.js';
import Schema from './schema.js';

describe('Set', () => {
  describe('invalid set of data types', () => {
    test('empty set', () => {
      expect.assertions(7);
      try {
        new Model({
          prop: new Set(),
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Model schema is invalid: "prop" property is invalid (see "error.cause" for details)'
        );
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeDefined();
        expect(error.cause.message).toEqual('At least 2 data types must be specified in a set');
        expect(error.cause.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.cause.cause).toBeUndefined();
      }
    });
    test('empty set with array', () => {
      expect.assertions(7);
      try {
        new Model({
          prop: new Set([]),
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Model schema is invalid: "prop" property is invalid (see "error.cause" for details)'
        );
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeDefined();
        expect(error.cause.message).toEqual('At least 2 data types must be specified in a set');
        expect(error.cause.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.cause.cause).toBeUndefined();
      }
    });
    test('a set with a single data type', () => {
      expect.assertions(7);
      try {
        new Model({
          prop: new Set([Number]),
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Model schema is invalid: "prop" property is invalid (see "error.cause" for details)'
        );
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeDefined();
        expect(error.cause.message).toEqual('At least 2 data types must be specified in a set');
        expect(error.cause.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.cause.cause).toBeUndefined();
      }
    });
    test('a set with an invalid data type', () => {
      expect.assertions(7);
      try {
        new Model({
          prop: new Set([Number, String, () => {}]),
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Model schema is invalid: "prop" property is invalid (see "error.cause" for details)'
        );
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeDefined();
        expect(error.cause.message).toEqual('Unknown data type');
        expect(error.cause.name).toEqual(DataType.ValidationError);
        expect(error.cause.cause).toBeUndefined();
      }
    });
    test('overlapping data types', () => {
      const TestModel = new Model({
        prop: new Set(['123', String]),
      });
      expect.assertions(4);
      try {
        new TestModel({
          prop: '123',
        });
      } catch (error) {
        expect(error.message).toEqual('A value of "prop" property matches multiple data types from a set');
        expect(error.name).toEqual(Schema.InvalidModelSchemaError);
        expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        expect(error.cause).toBeUndefined();
      }
    });
  });

  describe('valid set of primitive data types', () => {
    const TestModel = new Model({
      subModel: {
        prop: new Set([Number, String, Boolean]),
      },
    });
    test('valid values', () => {
      const testNumber = new TestModel({
        subModel: {
          prop: 123,
        },
      });
      const testString = new TestModel({
        subModel: {
          prop: '123',
        },
      });
      const testBoolean = new TestModel({
        subModel: {
          prop: false,
        },
      });
      expect(testNumber.subModel.prop).toEqual(123);
      expect(testString.subModel.prop).toEqual('123');
      expect(testBoolean.subModel.prop).toEqual(false);
    });
    test('invalid values', () => {
      expect.assertions(4);
      try {
        new TestModel({
          subModel: {
            prop: () => {},
          },
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Data is not valid: "subModel.prop" validation errors: must be a number or must be a string or must be a boolean'
        );
        expect(error.name).toEqual(DataType.ValidationError);
        expect(error.name).toEqual('DataType|ValidationError');
        expect(error.cause).toEqual([
          '"subModel.prop" validation errors: must be a number or must be a string or must be a boolean',
        ]);
      }
    });
  });

  describe('a set of complex data types', () => {
    const Type1 = new Model({
      type: 'type1',
      name: String,
      value: String,
    });
    const Type2 = new Model({
      type: 'type2',
      name: String,
      value: String,
    });
    const TestModel = new Model({
      subModel: {
        prop: new Set([Type1, Type2]),
      },
    });
    test('valid values', () => {
      const test1 = new TestModel({
        subModel: {
          prop: {
            type: 'type1',
            name: 'field 1',
            value: 'value 1',
          },
        },
      });
      const test2 = new TestModel({
        subModel: {
          prop: {
            type: 'type2',
            name: 'field 2',
            value: 'value 2',
          },
        },
      });
      expect(test1.subModel.prop.name).toEqual('field 1');
      expect(test1.subModel.prop.value).toEqual('value 1');
      expect(test2.subModel.prop.name).toEqual('field 2');
      expect(test2.subModel.prop.value).toEqual('value 2');
    });
    test('invalid values', () => {
      expect.assertions(4);
      try {
        new TestModel({
          subModel: {
            prop: {
              type: 'type',
              name: 123,
              value: 123,
            },
          },
        });
      } catch (error) {
        expect(error.message).toEqual(
          'Data is not valid: "subModel.prop" validation errors: "type" must be equal to "type1" or "name" must be a string or "value" must be a string or "type" must be equal to "type2"'
        );
        expect(error.name).toEqual(DataType.ValidationError);
        expect(error.name).toEqual('DataType|ValidationError');
        expect(error.cause).toEqual([
          '"subModel.prop" validation errors: "type" must be equal to "type1" or "name" must be a string or "value" must be a string or "type" must be equal to "type2"',
        ]);
      }
    });
  });
});
