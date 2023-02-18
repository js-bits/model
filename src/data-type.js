/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';

const DATA_TYPES = new Map();

const ERRORS = enumerate('DataType|')`
  InvalidDataTypeError
`;

export default class DataType {
  static toString() {
    return '[class DataType]';
  }

  constructor(config) {
    if (arguments.length) {
      let typeDef;

      class _DataType_ extends DataType {
        constructor() {
          const error = new Error('Data type instantiation is not allowed');
          error.name = ERRORS.InvalidDataTypeError;
          throw error;
        }

        // name // for GraphQL conversion
        // compare // for sorting

        static fromJSON(inputValue) {
          this.validate(inputValue, true);
          if (typeDef.fromJSON) return typeDef.fromJSON(inputValue);
          return inputValue;
        }

        static toJSON(value) {
          let outputValue = value;
          if (typeDef.toJSON) outputValue = typeDef.toJSON(value);
          this.validate(outputValue, true);
          return outputValue;
        }

        static validate(value, hardCheck) {
          const result = DataType.validate(_DataType_, value);
          if (result && hardCheck) {
            const error = new Error('Data type is invalid');
            error.name = ERRORS.InvalidDataTypeError;
            throw error;
          }
          return result;
        }
      }

      typeDef = DataType.add(_DataType_, config);
      // eslint-disable-next-line no-constructor-return
      return _DataType_;
    } // else prototype is being created
  }

  static add(type, config) {
    let validator;
    if (typeof config === 'function') {
      validator = config;
    } else if (config && typeof config === 'object' && typeof config.validate === 'function') {
      validator = config.validate;
    }
    if (!validator) {
      const error = new Error('Data type is invalid');
      error.name = ERRORS.InvalidDataTypeError;
      throw error;
    }

    const typeDef = {
      validate: validator,
    };

    if (typeof config === 'object') {
      if (Object.prototype.hasOwnProperty.call(config, 'extends')) {
        if (!DataType.exists(config.extends)) {
          const error = new Error('Base data type is invalid');
          error.name = ERRORS.InvalidDataTypeError;
          throw error;
        }
        typeDef.extends = config.extends;
      }
      if (
        Object.prototype.hasOwnProperty.call(config, 'fromJSON') ||
        Object.prototype.hasOwnProperty.call(config, 'toJSON')
      ) {
        if (typeof config.fromJSON !== 'function' || typeof config.toJSON !== 'function') {
          const error = new Error('Both "fromJSON" and "toJSON" must defined as functions');
          error.name = ERRORS.InvalidDataTypeError;
          throw error;
        }
        typeDef.fromJSON = config.fromJSON;
        typeDef.toJSON = config.toJSON;
      }
    }

    Object.freeze(typeDef);

    DATA_TYPES.set(type, typeDef);

    return typeDef;
  }

  static exists(type) {
    if (DATA_TYPES.has(type)) return true;
    if (enumerate.isEnum(type)) {
      DataType.add(type, value => {
        const allowedValues = Object.values(type);
        const list = allowedValues.map(item => String(item)).join(',');
        return allowedValues.includes(value) ? undefined : `must be one of allowed values [${list}]`;
      });
      return true;
    }
    return false;
  }

  /**
   * Validates a value against a given type
   * @param {Object} type
   * @param {*} value
   * @returns {Array}
   */
  static validate(type, value) {
    const typeDef = DATA_TYPES.get(type);
    if (!typeDef) {
      const error = new Error('Unknown data type');
      error.name = ERRORS.InvalidDataTypeError;
      throw error;
    }
    let error;
    if (typeDef.extends) {
      error = DataType.validate(typeDef.extends, value);
    }

    // if no error messages from a base validator
    if (!error) {
      const validator = typeDef.validate;
      error = validator(value);
    }

    return error;
  }

  static fromJSON(type, value) {
    if (this.validate(type, value)) {
      throw new Error('Invalid');
    }

    const typeDef = DATA_TYPES.get(type);
    return typeDef.fromJSON ? typeDef.fromJSON(value) : value;
  }

  static is(type, value) {
    return !DataType.validate(type, value);
  }
}

DataType.add(String, value => (typeof value === 'string' ? undefined : 'must be a string'));
DataType.add(Number, value => (typeof value === 'number' ? undefined : 'must be a number'));
DataType.add(Boolean, value => (typeof value === 'boolean' ? undefined : 'must be a boolean'));
DataType.add(Date, value => (value instanceof Date ? undefined : 'must be a date'));
DataType.add(Array, value => (Array.isArray(value) ? undefined : 'must be an array'));
DataType.add(DataType, value => (DataType.exists(value) ? undefined : 'must be a data type'));
DataType.add(JSON, value =>
  !enumerate.isEnum(value) && value !== JSON && value instanceof Object && value.constructor === Object
    ? undefined
    : 'must be a plain object'
);

Object.assign(DataType, ERRORS);
