/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';

const DATA_TYPES = new WeakMap();

const ERRORS = enumerate(String)`
InvalidDataTypeError
UnknownDataTypeError
`;

export default class DataType {
  static toString() {
    return '[class DataType]';
  }

  constructor(typeDef) {
    class NewDataType extends DataType {
      // eslint-disable-next-line no-useless-constructor
      constructor() {
        super();
      }

      // fromJSON() {} // fromStorage() // parse() // encode // serialize
      // toJSON() {} // toStore() // decode // deserialize
    }
    DataType.add(NewDataType, typeDef);
    return NewDataType;
  }

  static add(type, typeDef) {
    let validator;
    if (typeof typeDef === 'function') {
      validator = typeDef;
    } else if (typeDef && typeof typeDef === 'object' && typeof typeDef.validate === 'function') {
      validator = typeDef.validate;
    }
    if (!validator) {
      const error = new Error('Data type is invalid');
      error.name = ERRORS.InvalidDataTypeError;
      throw error;
    }

    if (typeof typeDef === 'object') {
      if (Object.prototype.hasOwnProperty.call(typeDef, 'extends') && !DataType.exists(typeDef.extends)) {
        const error = new Error('Base data type is invalid');
        error.name = ERRORS.InvalidDataTypeError;
        throw error;
      }
    }

    DATA_TYPES.set(type, typeDef);
  }

  static exists(type) {
    return DATA_TYPES.has(type);
  }

  static get(type) {
    const validator = DATA_TYPES.get(type);
    if (!validator) {
      const error = new Error('Unknown data type');
      error.name = ERRORS.UnknownDataTypeError;
      throw error;
    }
    return validator;
  }

  static validate(type, value) {
    const typeDef = DataType.get(type);
    if (typeDef.extends) {
      const errorMessage = DataType.validate(typeDef.extends, value);
      if (errorMessage) {
        return errorMessage;
      }
    }

    const validator = typeDef.validate || typeDef;
    return validator(value);
  }
}

DataType.add(String, value => (typeof value === 'string' ? undefined : 'must be a string'));
DataType.add(Number, value => (typeof value === 'number' ? undefined : 'must be a number'));
DataType.add(Boolean, value => (typeof value === 'boolean' ? undefined : 'must be a boolean'));
DataType.add(Date, value => (value instanceof Date ? undefined : 'must be a date'));
DataType.add(JSON, value =>
  value instanceof Object && value.constructor === Object ? undefined : 'must be a plain object'
);

Object.assign(DataType, ERRORS);
