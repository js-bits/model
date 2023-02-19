/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate`
  typeDef
`;

export const ERRORS = enumerate('DataType|')`
  InvalidDataTypeError
`;

export const DATA_TYPES = new Map();

const hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

class DataTypeDefinition {
  static toString() {
    return '[class DataTypeDefinition]';
  }

  constructor(config) {
    // eslint-disable-next-line no-constructor-return
    if (!arguments.length) return this; // prototype is being created

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
        if (!DATA_TYPES.has(config.extends)) {
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

    this[ø.typeDef] = typeDef;

    // name // for GraphQL conversion
    // compare // for sorting
  }

  fromJSON(inputValue) {
    this.assert(inputValue);
    if (hasOwn(this[ø.typeDef], 'fromJSON')) return this[ø.typeDef].fromJSON(inputValue);
    return inputValue;
  }

  toJSON(value) {
    let outputValue = value;
    if (hasOwn(this[ø.typeDef], 'toJSON')) outputValue = this[ø.typeDef].toJSON(value);
    this.assert(outputValue);
    return outputValue;
  }

  validate(value) {
    if (hasOwn(this[ø.typeDef], 'extends')) {
      const error = DATA_TYPES.get(this[ø.typeDef].extends).validate(value);
      if (error) return error;
    }
    // if no error messages from a base validator
    return this[ø.typeDef].validate(value);
  }

  assert(value) {
    const result = this.validate(value);
    if (result) {
      const error = new Error('Data is invalid');
      error.name = ERRORS.InvalidDataTypeError;
      error.cause = result;
      throw error;
    }
  }
}

export default DataTypeDefinition;
