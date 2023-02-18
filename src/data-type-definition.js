/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';

export const ERRORS = enumerate('DataType|')`
  InvalidDataTypeError
`;

export const DATA_TYPES = new Map();

const hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

class DataTypeDefinition {
  constructor(config) {
    // eslint-disable-next-line no-constructor-return
    if (!arguments.length) return this;

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
      if (hasOwn(config, 'extends')) {
        if (!DataTypeDefinition.exists(config.extends)) {
          const error = new Error('Base data type is invalid');
          error.name = ERRORS.InvalidDataTypeError;
          throw error;
        }
        typeDef.extends = config.extends;
      }
      if (hasOwn(config, 'fromJSON') || hasOwn(config, 'toJSON')) {
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

    class _DataType_ {
      static toString() {
        return '[class DataTypeDefinition]';
      }

      constructor() {
        const error = new Error('Data type instantiation is not allowed');
        error.name = ERRORS.InvalidDataTypeError;
        throw error;
      }

      // name // for GraphQL conversion
      // compare // for sorting

      static fromJSON(inputValue) {
        this.assert(inputValue);
        if (hasOwn(typeDef, 'fromJSON')) return typeDef.fromJSON(inputValue);
        return inputValue;
      }

      static toJSON(value) {
        let outputValue = value;
        if (hasOwn(typeDef, 'toJSON')) outputValue = typeDef.toJSON(value);
        this.assert(outputValue);
        return outputValue;
      }

      static validate(value) {
        if (hasOwn(typeDef, 'extends')) {
          const error = DATA_TYPES.get(typeDef.extends).validate(value);
          if (error) return error;
        }
        // if no error messages from a base validator
        return typeDef.validate(value);
      }

      static assert(value) {
        const result = this.validate(value);
        if (result) {
          const error = new Error('Data is invalid');
          error.name = ERRORS.InvalidDataTypeError;
          throw error;
        }
      }
    }

    // eslint-disable-next-line no-constructor-return
    return _DataType_;
  }

  static add(type, typeDef) {
    DATA_TYPES.set(type, typeDef);
  }

  static exists(type) {
    return DATA_TYPES.has(type);
  }

  /**
   * Validates passed data type
   * @param {Object} type
   * @throws {InvalidDataTypeError}
   */
  static assert(type) {
    if (!this.exists(type)) {
      const error = new Error('Unknown data type');
      error.name = ERRORS.InvalidDataTypeError;
      throw error;
    }
  }

  /**
   * Validates a value against given type and returns error messages
   * @param {Object} type
   * @param {*} value
   * @returns {Array}
   */
  static validate(type, value) {
    this.assert(type);
    return DATA_TYPES.get(type).validate(value);
  }

  static fromJSON(type, value) {
    this.assert(type);
    return DATA_TYPES.get(type).fromJSON(value);
  }

  static toJSON(type, value) {
    this.assert(type);
    return DATA_TYPES.get(type).toJSON(value);
  }

  static is(type, value) {
    return !this.validate(type, value);
  }
}

export default DataTypeDefinition;
