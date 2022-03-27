// eslint-disable-next-line max-classes-per-file
import Model from '../src/model.js';
import DataType from '../src/data-type.js';

describe('Custom data type', () => {
  describe('without base type', () => {
    test('invalid validator', () => {
      expect(() => {
        new DataType();
      }).toThrowError('Invalid data type');
      expect(() => {
        new DataType(null);
      }).toThrowError('Invalid data type');
      expect(() => {
        new DataType(123123);
      }).toThrowError('Invalid data type');
    });

    describe('valid validator', () => {
      class NewType {
        static validate(value) {
          if (value !== 'valid') return 'must have a valid value';
        }
      }
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
    class Int extends Number {
      static validate(value) {
        if (!Number.isInteger(value)) return 'must be an integer';
      }
    }
    class PositiveInt extends Int {
      static validate(value) {
        if (value <= 0) return 'must be a positive integer';
      }
    }
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
        new DataType(() => {}, NewClass);
      }).toThrowError('Invalid data type');
      expect(() => {
        new DataType(() => {}, null);
      }).toThrowError('Invalid data type');
      expect(() => {
        new DataType(
          () => {},
          () => {}
        );
      }).toThrowError('Invalid data type');
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
