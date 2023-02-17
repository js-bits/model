import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';

const ERRORS = enumerate(String)`
InvalidModelSchemaError
InvalidDataError
`;

const REQUIRED_FIELD_SPECIFIER = '!';
const OPTIONAL_FIELD_SPECIFIER = '?';
const FIELD_NAME_REGEXP = /^(.+)([?!])$/;

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate`
required
requiredFlag
`;

/**
 * Supports only primitive data types (defined with DataType class) by default
 */
class Schema {
  constructor(config) {
    if (!DataType.is(JSON, config)) {
      const error = new Error('Model schema is invalid');
      error.name = ERRORS.InvalidModelSchemaError;
      throw error;
    }

    if (Object.keys(config).length === 0) {
      const error = new Error('Model schema is empty');
      error.name = ERRORS.InvalidModelSchemaError;
      throw error;
    }

    this[ø.required] = {};
    for (const [key, type] of Object.entries(config)) {
      this.initEntry(key, type);
    }

    Object.freeze(this);
  }

  initEntry(key, type) {
    const propName = this.initKey(key);
    const propType = this.initType(type);

    if (!propType) {
      const error = new Error(`Model schema is invalid: data type of "${propName}" property is invalid`);
      error.name = ERRORS.InvalidModelSchemaError;
      throw error;
    }
    this[propName] = propType;
  }

  // eslint-disable-next-line class-methods-use-this
  initType(propType) {
    if (DataType.exists(propType)) {
      return propType;
    }
    if (enumerate.isEnum(propType) && !DataType.exists(propType)) {
      DataType.add(propType, value => {
        const allowedValues = Object.values(propType);
        const list = allowedValues.map(item => String(item)).join(',');
        return allowedValues.includes(value) ? undefined : `must be one of allowed values [${list}]`;
      });
      return propType;
    }
  }

  initKey(key) {
    let specifier;
    let propName = key;
    const globalFlag = this[ø.requiredFlag];
    const match = key.match(FIELD_NAME_REGEXP);
    if (match) {
      [, propName, specifier] = match;
      if (
        globalFlag !== undefined &&
        specifier !== (globalFlag ? REQUIRED_FIELD_SPECIFIER : OPTIONAL_FIELD_SPECIFIER)
      ) {
        const error = new Error(
          `Model schema is invalid. Must contain either ${OPTIONAL_FIELD_SPECIFIER} or ${REQUIRED_FIELD_SPECIFIER} specifiers`
        );
        error.name = Schema.InvalidModelSchemaError;
        throw error;
      }
      this[ø.requiredFlag] = specifier === REQUIRED_FIELD_SPECIFIER;
    }
    this[ø.required][propName] = !specifier;

    return propName;
  }

  isRequired(name) {
    return this[ø.required][name] === !this[ø.requiredFlag];
  }

  // eslint-disable-next-line class-methods-use-this
  validateEntry(propType, propValue) {
    return DataType.validate(propType, propValue);
  }

  // eslint-disable-next-line class-methods-use-this
  transformValue(propType, propValue) {
    if (DataType.is(DataType, propType)) return propType.fromJSON(propValue);
    return propValue;
  }

  static setGlobalSchema(GlobalSchema) {
    globalSchema = GlobalSchema;
  }

  static getGlobalSchema() {
    return globalSchema;
  }
}

let globalSchema = Schema;

Object.assign(Schema, ERRORS);
Object.freeze(Schema);

export default Schema;
