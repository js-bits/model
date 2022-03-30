// eslint-disable-next-line max-classes-per-file
import Model from '../src/model.js';
import DataType from '../src/data-type.js';

describe('Custom data type', () => {
  describe('without base type', () => {
    describe('valid validator', () => {
      const NewType = new DataType({
        validate(value) {
          return value !== 'valid' ? 'must have a valid value' : undefined;
        },
      });
      // const NewType = new DataType(value => (value === 'valid' ? undefined : ));
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
        expect(() => {
          new NewModel({
            field: 'other value',
          });
        }).toThrowError('Invalid data');
        try {
          new NewModel({
            field: '123',
          });
        } catch (error) {
          expect(error).toEqual(new Error('Invalid data'));
          expect(error.cause).toEqual(['Field "field": must have a valid value']);
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
      extend: Int,
      validate(value) {
        return value <= 0 ? 'must be a positive integer' : undefined;
      },
    });
    // const Int = new DataType(value => (Number.isInteger(value) ? undefined : 'must be an integer'), Number);
    // const PositiveInt = new DataType(value => (value > 0 ? undefined : 'must be a positive integer'), Int);
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
      }).toThrowError('Base data type is invalid');
      expect(() => {
        new DataType({
          extends: null,
          validate: () => {},
        });
      }).toThrowError('Base data type is invalid');
      expect(() => {
        new DataType({
          extends: () => {},
          validate: () => {},
        });
      }).toThrowError('Base data type is invalid');
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
      expect.assertions(6);
      try {
        new TestModel1({
          int: '123',
        });
      } catch (error) {
        expect(error).toEqual(new Error('Invalid data'));
        expect(error.cause).toEqual(['Field "int": must be a number']);
      }
      try {
        new TestModel1({
          int: 456.3535,
        });
      } catch (error) {
        expect(error).toEqual(new Error('Invalid data'));
        expect(error.cause).toEqual(['Field "int": must be an integer']);
      }
      try {
        new TestModel2({
          int: -456,
        });
      } catch (error) {
        expect(error).toEqual(new Error('Invalid data'));
        expect(error.cause).toEqual(['Field "int": must be a positive integer']);
      }
    });
  });
});
