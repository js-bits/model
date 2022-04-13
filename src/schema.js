import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';

const TERMS = new Set();

const ERRORS = enumerate(String)`
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
      this.processEntry(key, type);
    }

    Object.freeze(this);
  }

  processEntry(key, type) {
    const propName = this.processKey(key);
    let propType;

    for (const term of TERMS) {
      propType = term.init(type);
      if (propType) break;
    }

    if (!propType) {
      const error = new Error(`Model schema is invalid: data type of "${propName}" property is invalid`);
      error.name = ERRORS.InvalidModelSchemaError;
      throw error;
    }
    this[propName] = propType;
  }

  processKey(key) {
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

  static addTerm(term) {
    TERMS.add(term);
  }
}

Object.assign(Schema, ERRORS);

export default Schema;

/**
 * Adds support of primitive data types
 */
Schema.addTerm({
  init(propType) {
    if (DataType.exists(propType)) {
      return propType;
    }
  },
});

/**
 * Adds support of enum data type
 */
Schema.addTerm({
  init(propType) {
    if (enumerate.isEnum(propType) && !DataType.exists(propType)) {
      DataType.add(propType, value => {
        const allowedValues = Object.values(propType);
        const list = allowedValues.map(item => String(item)).join(',');
        return allowedValues.includes(value) ? undefined : `must be one of allowed values [${list}]`;
      });
      return propType;
    }
  },
});
