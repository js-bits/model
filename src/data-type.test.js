import DataType from './data-type.js';

describe('DataType', () => {
  describe('#constructor', () => {
    test('conversion to string', () => {
      expect(`${DataType}`).toEqual('[class DataType]');
    });
    test('invalid validator', () => {
      expect.assertions(6);
      expect(() => {
        new DataType();
      }).toThrowError('Data type is invalid');
      expect(() => {
        new DataType(undefined);
      }).toThrowError('Data type is invalid');
      expect(() => {
        new DataType(null);
      }).toThrowError('Data type is invalid');

      try {
        new DataType(123123);
      } catch (error) {
        expect(error.message).toEqual('Data type is invalid');
        expect(error.name).toEqual(DataType.InvalidDataTypeError);
        expect(error.name).toEqual('InvalidDataTypeError');
      }
    });

    describe('simple data type with a function-based validator', () => {
      const CustomType = new DataType(value => (value !== 'valid' ? 'must have a valid value' : undefined));
      test('unexpected instantiation', () => {
        expect(() => {
          new CustomType(() => {});
        }).toThrowError('Data type is invalid');
      });
      test('conversion to string', () => {
        expect(`${CustomType}`).toEqual('[class DataType]');
      });
      test('invalid value', () => {
        expect(DataType.validate(CustomType, 123)).toEqual(['must have a valid value']);
      });
      test('valid value', () => {
        expect(DataType.validate(CustomType, 'valid')).toBeUndefined();
      });
    });

    describe('simple data type with a object-based definition', () => {
      const CustomType = new DataType({
        validate(value) {
          return value !== 'valid' ? 'must have a valid value' : undefined;
        },
      });
      test('invalid value', () => {
        expect(DataType.validate(CustomType, 123)).toEqual(['must have a valid value']);
      });
      test('valid value', () => {
        expect(DataType.validate(CustomType, 'valid')).toBeUndefined();
      });
    });

    describe('derived data type with a object-based definition', () => {
      const CustomType = new DataType({
        extends: String,
        validate(value) {
          return value !== 'valid' ? 'must have a valid value' : undefined;
        },
      });
      test('invalid data type', () => {
        expect(() => {
          new DataType({
            extends: Promise,
            validate(value) {
              return value !== 'valid' ? 'must have a valid value' : undefined;
            },
          });
        }).toThrowError('Base data type is invalid');
      });
      test('invalid value type', () => {
        expect(DataType.validate(CustomType, 123)).toEqual(['must be a string']);
      });
      test('invalid value', () => {
        expect(DataType.validate(CustomType, '123')).toEqual(['must have a valid value']);
      });
      test('valid value', () => {
        expect(DataType.validate(CustomType, 'valid')).toBeUndefined();
      });
    });

    describe('multiple inherited data types with a object-based definition', () => {
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
      test('invalid value type', () => {
        expect(DataType.validate(PositiveInt, true)).toEqual(['must be a number']);
      });
      test('invalid value 1', () => {
        expect(DataType.validate(PositiveInt, 12.34)).toEqual(['must be an integer']);
      });
      test('invalid value 2', () => {
        expect(DataType.validate(PositiveInt, -123)).toEqual(['must be a positive integer']);
      });
      test('valid value', () => {
        expect(DataType.validate(PositiveInt, 123)).toBeUndefined();
      });
    });
  });

  describe('built-in types', () => {
    describe('String', () => {
      test('invalid value', () => {
        expect(DataType.validate(String, undefined)).toEqual(['must be a string']);
        expect(DataType.validate(String, null)).toEqual(['must be a string']);
        expect(DataType.validate(String, 123)).toEqual(['must be a string']);
      });
      test('valid value', () => {
        expect(DataType.validate(String, '123')).toBeUndefined();
      });
    });
    describe('Number', () => {
      test('invalid value', () => {
        expect(DataType.validate(Number, undefined)).toEqual(['must be a number']);
        expect(DataType.validate(Number, null)).toEqual(['must be a number']);
        expect(DataType.validate(Number, '123')).toEqual(['must be a number']);
      });
      test('valid value', () => {
        expect(DataType.validate(Number, 123.23)).toBeUndefined();
      });
    });
    describe('Boolean', () => {
      test('invalid value', () => {
        expect(DataType.validate(Boolean, null)).toEqual(['must be a boolean']);
      });
      test('valid value', () => {
        expect(DataType.validate(Boolean, true)).toBeUndefined();
      });
    });
    describe('Date', () => {
      test('invalid value', () => {
        expect(DataType.validate(Date, undefined)).toEqual(['must be a date']);
        expect(DataType.validate(Date, null)).toEqual(['must be a date']);
        expect(DataType.validate(Date, true)).toEqual(['must be a date']);
      });
      test('valid value', () => {
        expect(DataType.validate(Date, new Date())).toBeUndefined();
      });
    });
    describe('JSON', () => {
      test('invalid value', () => {
        expect(DataType.validate(JSON, undefined)).toEqual(['must be a plain object']);
        expect(DataType.validate(JSON, null)).toEqual(['must be a plain object']);
        expect(DataType.validate(JSON, new Date())).toEqual(['must be a plain object']);
      });
      test('valid value', () => {
        expect(DataType.validate(JSON, {})).toBeUndefined();
      });
    });
  });

  describe('.get', () => {
    test('unknown data type', () => {
      expect(() => {
        DataType.get(Promise);
      }).toThrowError('Unknown data type');
    });
  });

  describe('.is', () => {
    test('should return true for a valid value of a given type', () => {
      expect(DataType.is(String, '')).toBeTruthy();
    });
    test('should return false for an invalid value of a given type', () => {
      expect(DataType.is(String, 123)).toBeFalsy();
    });
  });

  describe('.validate', () => {
    const CustomType = new DataType(value => (value !== 'valid' ? ['must have a valid value'] : []));
    test('should return undefined for a valid value of a given type', () => {
      expect(DataType.validate(CustomType, 'valid')).toBeUndefined();
    });
    test('should return an array of error message for an invalid value of a given type', () => {
      expect(DataType.validate(CustomType, 'invalid')).toEqual(['must have a valid value']);
    });
    test('should throw an error if a validator returns an unexpected value', () => {
      const InvalidType = new DataType(value => (value !== 'valid' ? 123 : undefined));
      expect(() => {
        DataType.validate(InvalidType, 'invalid');
      }).toThrow('Return type of data validator is invalid. String, Array or undefined is expected');
    });
  });
});
