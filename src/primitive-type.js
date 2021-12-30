/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DATA_TYPES from './primitive-types.js';

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
    let baseValidator;
    if (typeof baseType !== 'undefined') {
      baseValidator = DATA_TYPES.get(baseType);
      if (!baseValidator) {
        throw new Error('Unknown primitive type');
      }
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
    DATA_TYPES.set(NewClass, value => {
      let errorMessage = baseValidator && baseValidator(value);
      if (!errorMessage) {
        errorMessage = validator(value);
      }
      return errorMessage;
    });
    return NewClass;
  }
}

Object.assign(DataType, ERRORS);
