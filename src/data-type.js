/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataTypeDefinition, { ERRORS, DATA_TYPES } from './data-type-definition.js';

export default class DataType {
  static toString() {
    return '[class DataType]';
  }

  constructor(config) {
    // eslint-disable-next-line no-constructor-return, constructor-super
    if (!arguments.length) return this; // prototype is being created

    class CustomDataType extends DataTypeDefinition {
      constructor() {
        const error = new Error('Data type instantiation is not allowed');
        error.name = ERRORS.InvalidDataTypeError;
        throw error;
      }

      static validate(value) {
        return DataType.validate(CustomDataType, value);
      }

      static fromJSON(value) {
        return DataType.fromJSON(CustomDataType, value);
      }

      static toJSON(value) {
        return DataType.toJSON(CustomDataType, value);
      }

      static is(value) {
        return !DataType.is(CustomDataType, value);
      }
    }
    DATA_TYPES.set(CustomDataType, new DataTypeDefinition(config));
    // eslint-disable-next-line no-constructor-return
    return CustomDataType;
  }

  static add(type, config) {
    DATA_TYPES.set(type, new DataTypeDefinition(config));
  }

  static exists(type) {
    if (DATA_TYPES.has(type)) return true;
    if (enumerate.isEnum(type)) {
      DataType.add(type, value => {
        const allowedValues = Object.values(type);
        const list = allowedValues.map(item => String(item)).join(',');
        return allowedValues.includes(value) ? undefined : `must be one of allowed values [${list}]`;
      });
      return true;
    }
    return false;
  }

  /**
   * Validates passed data type
   * @param {Object} type
   * @throws {InvalidDataTypeError}
   */
  static assert(type) {
    if (!this.exists(type)) {
      const error = new Error('Unknown data type');
      error.name = ERRORS.InvalidDataTypeError;
      throw error;
    }
  }

  static validate(type, value) {
    this.assert(type);
    return DATA_TYPES.get(type).validate(value);
  }

  static fromJSON(type, value) {
    this.assert(type);
    return DATA_TYPES.get(type).fromJSON(value);
  }

  static toJSON(type, value) {
    this.assert(type);
    return DATA_TYPES.get(type).toJSON(value);
  }

  static is(type, value) {
    return !this.validate(type, value);
  }
}

DataType.add(String, value => (typeof value === 'string' ? undefined : 'must be a string'));
DataType.add(Number, value => (typeof value === 'number' ? undefined : 'must be a number'));
DataType.add(Boolean, value => (typeof value === 'boolean' ? undefined : 'must be a boolean'));
DataType.add(Date, value => (value instanceof Date ? undefined : 'must be a date'));
DataType.add(Array, value => (Array.isArray(value) ? undefined : 'must be an array'));
DataType.add(DataType, value => (DataType.exists(value) ? undefined : 'must be a data type'));
DataType.add(JSON, value =>
  !enumerate.isEnum(value) && value !== JSON && value instanceof Object && value.constructor === Object
    ? undefined
    : 'must be a plain object'
);

Object.assign(DataType, ERRORS);
