import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';

describe('DataType', () => {
  describe('#constructor', () => {
    test('conversion to string', () => {
      expect(`${DataType}`).toEqual('[class DataType]');
    });
    test('invalid validator', () => {
      expect.assertions(6);
      expect(() => {
        new DataType('');
      }).toThrowError('Data type configuration is not valid: validator is missing');
      expect(() => {
        new DataType(undefined);
      }).toThrowError('Data type configuration is not valid: validator is missing');
      expect(() => {
        new DataType(null);
      }).toThrowError('Data type configuration is not valid: validator is missing');

      try {
        new DataType(123123);
      } catch (error) {
        expect(error.message).toEqual('Data type configuration is not valid: validator is missing');
        expect(error.name).toEqual(DataType.ConfigurationError);
        expect(error.name).toEqual('DataType|ConfigurationError');
      }
    });

    test('as a prototype', () => {
      const proto = new DataType();
      expect(proto).toEqual(expect.any(Object));
      expect(proto).toBeInstanceOf(Object);
      expect(proto).toBeInstanceOf(DataType);
    });

    test('inheritance', () => {
      const DerivedDataType = new DataType(() => {});
      expect(DerivedDataType).toBeInstanceOf(Object);
      expect(DerivedDataType).toEqual(expect.any(Function));
      expect(`${DerivedDataType}`).toEqual('[class DataTypeDefinition]');
    });

    describe('simple data type with a function-based validator', () => {
      const CustomType = new DataType(value => (value !== 'valid' ? 'must have a valid value' : undefined));
      test('unexpected instantiation', () => {
        expect(() => {
          new CustomType(() => {});
        }).toThrowError('Data type instantiation is not allowed');
      });
      test('conversion to string', () => {
        expect(`${CustomType}`).toEqual('[class DataTypeDefinition]');
      });
      test('invalid value', () => {
        expect(DataType.validate(CustomType, 123)).toEqual(['must have a valid value']);
        expect(CustomType.validate(123)).toEqual(['must have a valid value']);
        expect(CustomType.validate(123, 'var')).toEqual(['"var" must have a valid value']);
      });
      test('invalid value with property name', () => {
        expect(DataType.validate(CustomType, 123, 'var')).toEqual(['"var" must have a valid value']);
        expect(CustomType.validate(123, 'var')).toEqual(['"var" must have a valid value']);
      });
      test('valid value', () => {
        expect(DataType.validate(CustomType, 'valid')).toBeUndefined();
        expect(CustomType.validate('valid')).toBeUndefined();
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
        expect(CustomType.validate(123)).toEqual(['must have a valid value']);
      });
      test('valid value', () => {
        expect(DataType.validate(CustomType, 'valid')).toBeUndefined();
        expect(CustomType.validate('valid')).toBeUndefined();
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
        }).toThrowError('Data type configuration is not valid: unknown base data type');
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
    describe('null', () => {
      test('invalid value', () => {
        expect(DataType.validate(null, undefined)).toEqual(['must be null']);
        expect(DataType.validate(null, '')).toEqual(['must be null']);
        expect(DataType.validate(null, 123)).toEqual(['must be null']);
        expect(DataType.validate(null, 123, 'var')).toEqual(['"var" must be null']);
      });
      test('valid value', () => {
        expect(DataType.validate(null, null)).toBeUndefined();
        expect(DataType.is(null, null)).toBe(true);
      });
    });
    describe('String', () => {
      test('invalid value', () => {
        expect(DataType.validate(String, undefined)).toEqual(['must be a string']);
        expect(DataType.validate(String, null)).toEqual(['must be a string']);
        expect(DataType.validate(String, 123)).toEqual(['must be a string']);
        expect(DataType.validate(String, 123, 'var')).toEqual(['"var" must be a string']);
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
        expect(DataType.validate(JSON, [])).toEqual(['must be a plain object']);
      });
      test('valid value', () => {
        expect(DataType.validate(JSON, {})).toBeUndefined();
      });
    });
    describe('Array', () => {
      test('invalid value', () => {
        expect(DataType.validate(Array, undefined)).toEqual(['must be an array']);
        expect(DataType.validate(Array, null)).toEqual(['must be an array']);
        expect(DataType.validate(Array, new Date())).toEqual(['must be an array']);
        expect(DataType.validate(Array, {})).toEqual(['must be an array']);
      });
      test('valid value', () => {
        expect(DataType.validate(Array, [])).toBeUndefined();
      });
    });
    describe('DataType', () => {
      test('invalid value', () => {
        expect(DataType.validate(DataType, undefined)).toEqual(['must be a data type']);
        expect(DataType.validate(DataType, 123)).toEqual(['must be a data type']);
        expect(DataType.validate(DataType, new Date())).toEqual(['must be a data type']);
        expect(DataType.validate(DataType, {})).toEqual(['must be a data type']);
      });
      test('valid value', () => {
        expect(DataType.validate(DataType, Number)).toBeUndefined();
        expect(DataType.validate(DataType, JSON)).toBeUndefined();
      });
    });
  });

  describe('.exists', () => {
    test('known data type', () => {
      expect(DataType.exists(String)).toBe(true);
      expect(DataType.exists(JSON)).toBe(true);
    });
    test('unknown data type', () => {
      expect(DataType.exists(Promise)).toBe(false);
    });
    test('new enum', () => {
      const Enum = enumerate.ts('aa bb cc');
      expect(DataType.exists(Enum)).toBe(true);
      expect(DataType.is(Enum, Enum.bb)).toBe(true);
      expect(DataType.is(Enum, 'bb')).toBe(false);
    });
  });

  describe('.is', () => {
    test('should return true for a valid value of a given type', () => {
      expect(DataType.is(String, '')).toBe(true);
    });
    test('should return false for an invalid value of a given type', () => {
      expect(DataType.is(String, 123)).toBe(false);
    });
  });

  describe('.validate', () => {
    const CustomType = new DataType(value => (value !== 'valid' ? 'must have a valid value' : undefined));
    test('should return undefined for a valid value of a given type', () => {
      expect(DataType.validate(CustomType, 'valid')).toBeUndefined();
      expect(CustomType.validate('valid')).toBeUndefined();
    });
    test('should return an error message for an invalid value of a given type', () => {
      expect(DataType.validate(CustomType, 'invalid')).toEqual(['must have a valid value']);
      expect(CustomType.validate('invalid')).toEqual(['must have a valid value']);
    });
    test('should throw an error message for an invalid type', () => {
      expect(() => {
        DataType.validate(Promise, 'valid');
      }).toThrowError('Unknown data type');
      expect(() => {
        DataType.validate(Promise, 'valid', 'var');
      }).toThrowError('Unknown data type for "var"');
    });
  });

  describe('.assert', () => {
    const CustomType = new DataType(value => (value !== 'valid' ? 'must have a valid value' : undefined));
    test('should return undefined for a valid value of a given type', () => {
      expect(DataType.assert(CustomType, 'valid')).toBeUndefined();
      expect(CustomType.assert('valid')).toBeUndefined();
    });
    test('should throw an error message for an invalid type or value', () => {
      expect(() => {
        DataType.assert(Promise, 'valid');
      }).toThrowError('Unknown data type');
      expect(() => {
        DataType.assert(CustomType, 'invalid', 'var');
      }).toThrowError('Data is not valid: "var" must have a valid value');
    });

    describe('when validator returns multiple errors', () => {
      const AnotherType = new DataType(value =>
        value !== 'valid' ? ['must have a valid value', 'must be 100% valid'] : undefined
      );
      test('should throw an error message with the cause', () => {
        try {
          DataType.assert(AnotherType, 'invalid', 'var');
        } catch (error) {
          expect(error.message).toEqual('Data is not valid: see "error.cause" for details');
          expect(error.cause).toEqual(['must have a valid value', 'must be 100% valid']);
        }
      });
    });
  });

  describe('#toJSON/#fromJSON', () => {
    describe('if not defined explicitly', () => {
      const CustomType = new DataType({
        validate(value) {
          return value !== 'valid' ? 'must have a valid value' : undefined;
        },
      });
      describe('#fromJSON', () => {
        test('should return given value without any conversion', () => {
          expect(CustomType.fromJSON('valid')).toEqual('valid');
        });
      });
      describe('#toJSON', () => {
        test('should return given value without any conversion', () => {
          expect(CustomType.fromJSON('valid')).toEqual('valid');
        });
      });
      describe('DataType.fromJSON', () => {
        test('should convert given JSON data into a type acceptable by a data model', () => {
          expect(DataType.fromJSON(CustomType, 'valid')).toEqual('valid');
        });
      });
      describe('DataType.toJSON', () => {
        test('should return data converted into JSON compatible type', () => {
          expect(DataType.toJSON(CustomType, 'valid')).toEqual('valid');
        });
      });

      describe('if value is incorrect', () => {
        describe('#fromJSON', () => {
          test('incorrect value', () => {
            expect(() => {
              CustomType.fromJSON('invalid');
            }).toThrow('Data is not valid');
          });
        });
        describe('#toJSON', () => {
          test('incorrect value', () => {
            expect(() => {
              CustomType.toJSON('invalid');
            }).toThrow('Data is not valid');
          });
        });
      });
    });

    describe('if defined explicitly', () => {
      describe('if defined incorrectly', () => {
        test('wrong type', () => {
          expect(() => {
            new DataType({
              fromJSON: () => {},
              toJSON: {},
              validate: () => {},
            });
          }).toThrow('Data type configuration is not valid: both "fromJSON" and "toJSON" functions must defined');
        });
      });

      const isoDateRegExp = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/;
      const ISODate = new DataType({
        extends: String,
        fromJSON: value => new Date(value),
        toJSON: (/** @type {Date} */ value) => value.toISOString(),
        validate: value => (value.match(isoDateRegExp) ? undefined : 'must be in ISO date format'),
      });
      describe('ISODate data type validation', () => {
        test('should return undefined for a valid value of a given type', () => {
          expect(DataType.validate(ISODate, '2000-01-01T05:00:00.000Z')).toBeUndefined();
        });
        test('should return an error message for an invalid value of a given type', () => {
          expect(DataType.validate(ISODate, 'invalid')).toEqual(['must be in ISO date format']);
        });
      });

      describe('#fromJSON', () => {
        test('should convert given JSON data into a type acceptable by a data model', () => {
          const result = ISODate.fromJSON('2000-01-01T00:00:00.000Z');
          expect(result).toBeInstanceOf(Date);
          expect(result).toEqual(new Date('01/01/2000 UTC'));
        });
      });
      describe('#toJSON', () => {
        test('should return data converted into JSON compatible type', () => {
          expect(ISODate.toJSON(new Date('01/01/2000 UTC'))).toEqual('2000-01-01T00:00:00.000Z');
        });
      });

      describe('DataType.fromJSON', () => {
        test('should convert given JSON data into a type acceptable by a data model', () => {
          const result = DataType.fromJSON(ISODate, '2000-01-01T00:00:00.000Z');
          expect(result).toBeInstanceOf(Date);
          expect(result).toEqual(new Date('01/01/2000 UTC'));
        });
      });
      describe('DataType.toJSON', () => {
        test('should return data converted into JSON compatible type', () => {
          expect(DataType.toJSON(ISODate, new Date('01/01/2000 UTC'))).toEqual('2000-01-01T00:00:00.000Z');
        });
      });
    });
  });
});
