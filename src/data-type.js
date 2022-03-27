/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';

const ERRORS = enumerate(String)`
InvalidDataTypeError
`;

const DATA_TYPES = new WeakMap();

export default class DataType {
  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return 'DataType';
  }

  constructor(validator, baseType) {
    if (typeof validator !== 'function') {
      throw new Error('Invalid validator');
    }

    class NewClass extends DataType {
      // eslint-disable-next-line class-methods-use-this
      validate() {}

      // eslint-disable-next-line class-methods-use-this
      serialize() {} // fromStorage() // parse() // encode // fromJSON

      // eslint-disable-next-line class-methods-use-this
      deserialize() {} // toStore() // decode // toJSON
      // Date as an example (ISO string > Object)
    }
    DataType.add(NewClass, validator, baseType);
    return NewClass;
  }

  static add(type, validator, baseType) {
    let baseValidator;
    if (typeof baseType !== 'undefined') {
      baseValidator = DataType.get(baseType);
    }

    DATA_TYPES.set(type, value => {
      let errorMessage = baseValidator && baseValidator(value);
      if (!errorMessage) {
        errorMessage = validator(value);
      }
      return errorMessage;
    });
  }

  static exists(type) {
    return DATA_TYPES.has(type);
  }

  static get(type) {
    const validator = DATA_TYPES.get(type);
    if (!validator) {
      throw new Error('Unknown data type');
    }
    return validator;
  }

  static validate(type, value) {
    return DataType.get(type)(value);
  }
}


DataType.add(String, value => (typeof value === 'string' ? undefined : 'must be a string'));
DataType.add(Number, value => (typeof value === 'number' ? undefined : 'must be a number'));
DataType.add(Boolean, value => (typeof value === 'boolean' ? undefined : 'must be a boolean'));
DataType.add(Object, value => (typeof value === 'object' ? undefined : 'must be an object'));
DataType.add(Date, value => (value instanceof Date ? undefined : 'must be a date'));

Object.assign(DataType, ERRORS);
