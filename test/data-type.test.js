import DataType from '../src/data-type.js';

describe('DataType', () => {
  describe('#constructor', () => {
    test('invalid validator', () => {
      expect(() => {
        new DataType();
      }).toThrowError('Invalid data type');
      expect(() => {
        new DataType(undefined);
      }).toThrowError('Invalid data type');
      expect(() => {
        new DataType(null);
      }).toThrowError('Invalid data type');
      expect(() => {
        new DataType(123123);
      }).toThrowError('Invalid data type');

      try {
        new DataType(123123);
      } catch (error) {
        expect(error.message).toEqual('Invalid data type');
        expect(error.name).toEqual(DataType.InvalidDataTypeError);
        expect(error.name).toEqual('InvalidDataTypeError');
      }
    });

    describe('simple data type with a function-based validator', () => {
      const CustomType = new DataType(value => {
        if (value !== 'valid') return 'must have a valid value';
      });
      test('unexpected instantiation', () => {
        expect(() => {
          new CustomType(() => {});
        }).toThrowError('Invalid data type');
      });
      test('conversion to string', () => {
        expect(`${CustomType}`).toEqual('[class DataType]');
      });
      test('invalid value', () => {
        expect(DataType.validate(CustomType, 123)).toEqual('must have a valid value');
      });
      test('valid value', () => {
        expect(DataType.validate(CustomType, 'valid')).toBeUndefined();
      });
    });

    describe('simple data type with a object-based definition', () => {
      const CustomType = new DataType({
        validate(value) {
          if (value !== 'valid') return 'must have a valid value';
        },
      });
      test('invalid value', () => {
        expect(DataType.validate(CustomType, 123)).toEqual('must have a valid value');
      });
      test('valid value', () => {
        expect(DataType.validate(CustomType, 'valid')).toBeUndefined();
      });
    });

    describe('derived data type with a object-based definition', () => {
      const CustomType = new DataType({
        extends: String,
        validate(value) {
          if (value !== 'valid') return 'must have a valid value';
        },
      });
      test('invalid data type', () => {
        expect(() => {
          new DataType({
            extends: Promise,
            validate(value) {
              if (value !== 'valid') return 'must have a valid value';
            },
          });
        }).toThrowError('Invalid base data type');
      });
      test('invalid value type', () => {
        expect(DataType.validate(CustomType, 123)).toEqual('must be a string');
      });
      test('invalid value', () => {
        expect(DataType.validate(CustomType, '123')).toEqual('must have a valid value');
      });
      test('valid value', () => {
        expect(DataType.validate(CustomType, 'valid')).toBeUndefined();
      });
    });

    describe('multiple inherited data types with a object-based definition', () => {
      const Int = new DataType({
        extends: Number,
        validate(value) {
          if (!Number.isInteger(value)) return 'must be an integer';
        },
      });
      const PositiveInt = new DataType({
        extends: Int,
        validate(value) {
          if (value <= 0) return 'must be a positive integer';
        },
      });
      test('invalid value type', () => {
        expect(DataType.validate(PositiveInt, true)).toEqual('must be a number');
      });
      test('invalid value 1', () => {
        expect(DataType.validate(PositiveInt, 12.34)).toEqual('must be an integer');
      });
      test('invalid value 2', () => {
        expect(DataType.validate(PositiveInt, -123)).toEqual('must be a positive integer');
      });
      test('valid value', () => {
        expect(DataType.validate(PositiveInt, 123)).toBeUndefined();
      });
    });
  });

  describe('built-in types', () => {
    describe('String', () => {
      test('invalid value', () => {
        expect(DataType.validate(String, 123)).toEqual('must be a string');
      });
      test('valid value', () => {
        expect(DataType.validate(String, '123')).toBeUndefined();
      });
    });
    describe('Number', () => {
      test('invalid value', () => {
        expect(DataType.validate(Number, '123')).toEqual('must be a number');
      });
      test('valid value', () => {
        expect(DataType.validate(Number, 123.23)).toBeUndefined();
      });
    });
    describe('Boolean', () => {
      test('invalid value', () => {
        expect(DataType.validate(Boolean, null)).toEqual('must be a boolean');
      });
      test('valid value', () => {
        expect(DataType.validate(Boolean, true)).toBeUndefined();
      });
    });
    describe('Date', () => {
      test('invalid value', () => {
        expect(DataType.validate(Date, true)).toEqual('must be a date');
      });
      test('valid value', () => {
        expect(DataType.validate(Date, new Date())).toBeUndefined();
      });
    });
  });

  describe('#get', () => {
    test('unknown data type', () => {
      expect(() => {
        DataType.get(Promise);
      }).toThrowError('Unknown data type');
    });
  });
});
