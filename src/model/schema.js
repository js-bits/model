import enumerate from '@js-bits/enumerate';
import DataType from '../data-type/data-type.js';

const ERRORS = enumerate.ts(
  `
  InvalidModelSchemaError
`,
  'Schema|'
);

const REQUIRED_FIELD_SPECIFIER = '!';
const OPTIONAL_FIELD_SPECIFIER = '?';
const FIELD_NAME_REGEXP = /^(.+)([?!])$/;

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate.ts(`
  required
  requiredFlag
`);

const SHORTCUT_TYPES = new Map();

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
    try {
      const propType = Schema.initType(type);
      this[propName] = propType;
    } catch (cause) {
      const error = new Error(`Model schema is invalid: "${key}" property is invalid (see "error.cause" for details)`);
      error.name = ERRORS.InvalidModelSchemaError;
      error.cause = cause;
      throw error;
    }
  }

  static initType(type, key) {
    let finalType = type;
    [...SHORTCUT_TYPES.keys()].find(shortcutType => {
      if (DataType.is(shortcutType, type)) {
        finalType = SHORTCUT_TYPES.get(shortcutType)(type, key);
        return true;
      }
      return false;
    });
    return DataType.assertType(finalType, key);
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
          `Model schema is invalid: must contain either ${OPTIONAL_FIELD_SPECIFIER} or ${REQUIRED_FIELD_SPECIFIER} specifiers`
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
    DYNAMIC_DATA_TYPES.set(type, typeDef);
  }
}

Object.assign(Schema, ERRORS);
Object.freeze(Schema);

// shortcuts should be added on the data schema level since they dynamically create data types during the schema instantiation
[String, Number, Boolean].map(ConstantDataType =>
  Schema.add(
    ConstantDataType,
    constant =>
      new DataType({
        extends: ConstantDataType,
        validate: value =>
          value === constant
            ? undefined
            : `must be equal to ${typeof constant === 'string' ? `"${constant}"` : constant}`,
      })
  )
);

export default Schema;
