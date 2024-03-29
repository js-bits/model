/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate.ts(`
  typeDef
`);

export const ERRORS = enumerate.ts(
  `
  ConfigurationError
  ValidationError
`,
  'DataType|'
);

export const DATA_TYPES = new Map();

export const hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

const configError = ([reason]) => `Data type configuration is not valid: ${reason}`;

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
      const error = new Error(configError`validator is missing`);
      error.name = ERRORS.ConfigurationError;
      throw error;
    }

    const typeDef = {
      validate: validator,
    };

    if (typeof config === 'object') {
      if (hasOwn(config, 'extends')) {
        if (!DataTypeDefinition.exists(config.extends)) {
          const error = new Error(configError`unknown base data type`);
          error.name = ERRORS.ConfigurationError;
          throw error;
        }
        typeDef.extends = config.extends;
      }
      if (hasOwn(config, 'fromJSON') || hasOwn(config, 'toJSON')) {
        if (typeof config.fromJSON !== 'function' || typeof config.toJSON !== 'function') {
          const error = new Error(configError`both "fromJSON" and "toJSON" functions must defined`);
          error.name = ERRORS.ConfigurationError;
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

  fromJSON(inputValue, name) {
    this.assert(inputValue, name);
    if (hasOwn(this[ø.typeDef], 'fromJSON')) return this[ø.typeDef].fromJSON(inputValue, name);
    return inputValue;
  }

  toJSON(value, name) {
    let outputValue = value;
    if (hasOwn(this[ø.typeDef], 'toJSON')) outputValue = this[ø.typeDef].toJSON(value, name);
    this.assert(outputValue, name);
    return outputValue;
  }

  /**
   *
   * @param {*} value
   * @param {String} name
   * @returns {Array}
   */
  validate(value, name = '') {
    if (hasOwn(this[ø.typeDef], 'extends')) {
      const baseTypeError = DATA_TYPES.get(this[ø.typeDef].extends).validate(value, name);
      if (baseTypeError) return baseTypeError;
    }
    // if no error messages from a base validator
    const error = this[ø.typeDef].validate(value, name);
    return typeof error === 'string' ? [name ? `"${name}" ${error}` : error] : error;
  }

  assert(value, name = '') {
    const result = this.validate(value, name);
    if (result) {
      const message = result.length === 1 ? `${result[0]}` : 'see "error.cause" for details';
      const error = new Error(`Data is not valid: ${message}`);
      error.name = ERRORS.ValidationError;
      error.cause = result;
      throw error;
    }
  }

  static add(type, config) {
    DATA_TYPES.set(type, new DataTypeDefinition(config));
  }

  static exists(type) {
    if (DATA_TYPES.has(type)) return true;
    if (enumerate.isEnum(type)) {
      this.add(type, value => {
        const allowedValues = Object.values(type);
        const list = allowedValues.map(item => String(item)).join(',');
        return allowedValues.includes(value) ? undefined : `must be one of allowed values [${list}]`;
      });
      return true;
    }
    return false;
  }
}

export default DataTypeDefinition;
