import Model from '../src/model.js';
import DataType from '../src/data-type.js';

describe('Custom data type', () => {
  describe('without base type', () => {
    test('invalid validator', () => {
      expect(() => {
        new DataType();
      }).toThrowError('Invalid validator');
      expect(() => {
        new DataType(null);
      }).toThrowError('Invalid validator');
      expect(() => {
        new DataType(123123);
      }).toThrowError('Invalid validator');
    });

    describe('valid validator', () => {
      const NewType = new DataType(value => (value === 'valid' ? undefined : 'must have a valid value'));
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
    const Int = new DataType(value => (Number.isInteger(value) ? undefined : 'must be an integer'), Number);
    const PositiveInt = new DataType(value => (value > 0 ? undefined : 'must be a positive integer'), Int);
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
      }).toThrowError('Unknown data type');
      expect(() => {
        new DataType(() => {}, null);
      }).toThrowError('Unknown data type');
      expect(() => {
        new DataType(
          () => {},
          () => {}
        );
      }).toThrowError('Unknown data type');
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
