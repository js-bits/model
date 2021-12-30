/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DATA_TYPES from './data-types.js';

const ERRORS = enumerate(String)`
InvalidTypeError
`;

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

Object.assign(DataType, ERRORS);
