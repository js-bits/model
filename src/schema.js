import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import ø from './protected.js';

const TERMS = new Set();

const ERRORS = enumerate(String)`
InvalidModelSchemaError
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

    for (const [key, type] of Object.entries(config)) {
      this.processEntry(key, type);
    }

    Object.freeze(this);
  }

  processEntry(key, type) {
    const propName = this.processKey(key);
    let propType;

    for (const x of TERMS) {
      propType = x(type);
      if (propType) break;
    }

    if (!propType && !DataType.exists(type)) {
      const error = new Error(`Model schema is invalid: data type of "${propName}" property is invalid`);
      error.name = ERRORS.InvalidModelSchemaError;
      throw error;
    }
    this[propName] = propType || type;
  }

  processKey(key) {
    if (!this[ø.required]) {
      this[ø.required] = {
        [ø.isRequired](name) {
          return this[ø.required][name] === !this[ø.required][ø.requiredFlag];
        },
      };
      this[ø.isRequired] = name => this[ø.required][name] === !this[ø.required][ø.requiredFlag];
    }

    let specifier;
    let propName = key;
    const globalFlag = this[ø.required][ø.requiredFlag];
    const match = key.match(/^(.+)([?!])$/);
    if (match) {
      [, propName, specifier] = match;
      if (globalFlag !== undefined && specifier !== (globalFlag ? '!' : '?')) {
        const error = new Error('Model schema is invalid. Must contain either ? or ! specifiers');
        error.name = Schema.InvalidModelSchemaError;
        throw error;
      }
      this[ø.required][ø.requiredFlag] = specifier === '!';
    }
    this[ø.required][propName] = !specifier;

    return propName;
  }

  static addTerm(term) {
    TERMS.add(term);
  }
}

Object.assign(Schema, ERRORS);

export default Schema;

/**
 * Adds support of enum data type
 */
Schema.addTerm(propType => {
  if (enumerate.isEnum(propType)) {
    DataType.add(propType, value => {
      const allowedValues = Object.values(propType);
      const list = allowedValues.map(item => String(item)).join(',');
      return allowedValues.includes(value) ? undefined : `must be one of allowed values [${list}]`;
    });
    return propType;
  }
});
