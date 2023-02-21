import enumerate from '@js-bits/enumerate';
import DataType from '../data-type/data-type.js';

const ERRORS = enumerate('Schema|')`
InvalidModelSchemaError
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

const DYNAMIC_SCHEMAS = new Map();

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
    const propType = Schema.initType(type);

    if (propType === undefined) {
      const error = new Error(`Model schema is invalid: data type of "${propName}" property is invalid`);
      error.name = ERRORS.InvalidModelSchemaError;
      throw error;
    }
    this[propName] = propType;
  }

  static initType(propType) {
    const dynamicSchema = [...DYNAMIC_SCHEMAS.keys()].find(schemaType => DataType.is(schemaType, propType));
    if (dynamicSchema) return DYNAMIC_SCHEMAS.get(dynamicSchema)(propType);
    return DataType.exists(propType) ? propType : undefined;
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

  static add(type, typeDef) {
    DYNAMIC_SCHEMAS.set(type, typeDef);
  }
}

// TODO: add shortcuts for constants
// new Model({
//   prop1: 'constant', // String
//   prop2: 123, // Number
//   prop3: true, // Boolean
// });

Object.assign(Schema, ERRORS);
Object.freeze(Schema);

export default Schema;
