// eslint-disable-next-line max-classes-per-file
import Model from '../model.js';
import DataType from '../../data-type/data-type.js';

describe('Custom data type', () => {
  describe('without base type', () => {
    describe('valid validator', () => {
      const NewType = new DataType({
        validate(value) {
          return value !== 'valid' ? 'must have a valid value' : undefined;
        },
      });
      const NewModel = new Model({
        field: NewType,
      });
      test('correct value', () => {
        expect(() => {
          new NewModel({
            field: 'valid',
          });
        }).not.toThrow();
      });
      test('incorrect value', () => {
        expect.assertions(4);
        expect(() => {
          new NewModel({
            field: 'other value',
          });
        }).toThrowError('Data is not valid');
        try {
          new NewModel({
            field: '123',
          });
        } catch (error) {
          expect(error.name).toEqual('DataType|ValidationError');
          expect(error.message).toEqual('Data is not valid: "field" must have a valid value');
          expect(error.cause).toEqual(['"field" must have a valid value']);
        }
      });
    });
  });

  describe('with base type', () => {
    const Int = new DataType({
      extends: Number,
      validate(value) {
        return Number.isInteger(value) ? undefined : 'must be an integer';
      },
    });
    const PositiveInt = new DataType({
      extends: Int,
      validate(value) {
        return value <= 0 ? 'must be a positive integer' : undefined;
      },
    });
    const TestModel1 = new Model({
      int: Int,
    });
    const TestModel2 = new Model({
      int: PositiveInt,
    });
    test('invalid base type', () => {
      expect(() => {
        class NewClass {}
        new DataType({
          extends: NewClass,
          validate: () => {},
        });
      }).toThrowError('Data type configuration is not valid: unknown base data type');
      expect(() => {
        new DataType({
          extends: 123,
          validate: () => {},
        });
      }).toThrowError('Data type configuration is not valid: unknown base data type');
      expect(() => {
        new DataType({
          extends: () => {},
          validate: () => {},
        });
      }).toThrowError('Data type configuration is not valid: unknown base data type');
    });
    test('correct value', () => {
      expect(() => {
        new TestModel1({
          int: -456,
        });
        new TestModel2({
          int: 456,
        });
      }).not.toThrow();
    });

    test('incorrect value', () => {
      expect.assertions(12);
      try {
        new TestModel1({
          int: '123',
        });
      } catch (error) {
        expect(error.name).toEqual('DataType|ValidationError');
        expect(error.message).toEqual('Data is not valid: "int" must be a number');
        expect(error.cause).toEqual(['"int" must be a number']);
      }
      try {
        new TestModel1({
          int: 456.3535,
        });
      } catch (error) {
        expect(error.name).toEqual('DataType|ValidationError');
        expect(error.message).toEqual('Data is not valid: "int" must be an integer');
        expect(error.cause).toEqual(['"int" must be an integer']);
      }
      try {
        new TestModel2({
          int: 4.56,
        });
      } catch (error) {
        expect(error.name).toEqual('DataType|ValidationError');
        expect(error.message).toEqual('Data is not valid: "int" must be an integer');
        expect(error.cause).toEqual(['"int" must be an integer']);
      }
      try {
        new TestModel2({
          int: -456,
        });
      } catch (error) {
        expect(error.name).toEqual('DataType|ValidationError');
        expect(error.message).toEqual('Data is not valid: "int" must be a positive integer');
        expect(error.cause).toEqual(['"int" must be a positive integer']);
      }
    });

    describe('#fromJSON', () => {
      const isoDateRegExp = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/;
      const ISODate = new DataType({
        extends: String,
        fromJSON: value => new Date(value),
        toJSON: value => value.toISOString(),
        validate: value => (value.match(isoDateRegExp) ? undefined : 'must be in ISO date format'),
      });
      const CustomModel = new Model({
        int: Int,
        options: {
          date: ISODate,
        },
      });

      test('should convert given JSON data into a type acceptable by a data model', () => {
        const instance = new CustomModel({
          int: 123,
          options: {
            date: '2000-01-01T05:00:00.000Z',
          },
        });
        expect(instance).toBeInstanceOf(CustomModel);
        expect(instance.options.date).toBeInstanceOf(Date);
        expect(instance.options.date.getFullYear()).toEqual(2000);
        expect(JSON.stringify(instance)).toEqual('{"int":123,"options":{"date":"2000-01-01T05:00:00.000Z"}}');
      });
    });
  });
});
