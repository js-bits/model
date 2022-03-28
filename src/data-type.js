/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';

const DATA_TYPES = new WeakMap();

const ERRORS = enumerate(String)`
InvalidDataTypeError
UnknownDataTypeError
`;

const NO_TYPE = Object.getPrototypeOf(Object);

export default class DataType {
  constructor(typeDef) {
    let validator;
    if (typeof typeDef === 'function') {
      validator = typeDef;
    } else if (typeDef && typeof typeDef === 'object' && typeof typeDef.validate === 'function') {
      validator = typeDef.validate;
  }
    if (!validator) {
      const error = new Error('Invalid data type');
      error.name = ERRORS.InvalidDataTypeError;
      throw error;
    }

    const baseType = typeof typeDef === 'object' ? typeDef.extends : undefined;

    // console.log('baseType', baseType, `${baseType}`);

    class NewDataType extends DataType {
      static toString() {
        return '[class DataType]';
      }

      // eslint-disable-next-line no-useless-constructor
      constructor() {
        super();
      }

      static validate;

      // eslint-disable-next-line class-methods-use-this
      serialize() {} // fromStorage() // parse() // encode // fromJSON

      // eslint-disable-next-line class-methods-use-this
      deserialize() {} // toStore() // decode // toJSON
      // Date as an example (ISO string > Object)
    }
    // console.log('Type', typeDef);
    DataType.add(NewDataType, typeDef.validate, baseType !== NO_TYPE ? baseType : undefined);
    DataType.add(typeDef, typeDef.validate, baseType !== NO_TYPE ? baseType : undefined);
    return NewDataType;
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
      const error = new Error('Unknown data type');
      error.name = ERRORS.UnknownDataTypeError;
      throw error;
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
DataType.add(Date, value => (value instanceof Date ? undefined : 'must be a date'));

Object.assign(DataType, ERRORS);
