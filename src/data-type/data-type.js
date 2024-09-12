/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataTypeDefinition, { ERRORS, DATA_TYPES } from './data-type-definition.js';

const createNewDataType = () => {
  class CustomDataType extends DataTypeDefinition {
    constructor() {
      super();
      throw new Error('Data type instantiation is not allowed');
    }
  }
  return CustomDataType;
};

export default class DataType {
  static toString() {
    return '[class DataType]';
  }

  constructor(config, type = createNewDataType()) {
    // eslint-disable-next-line no-constructor-return, constructor-super
    if (!arguments.length) return this; // prototype is being created

    // expose useful methods
    ['validate', 'fromJSON', 'toJSON', 'is', 'assert'].forEach(method => {
      type[method] = (...args) => DataType[method](type, ...args);
    });
    Object.freeze(type);
    DataType.add(type, config);
    // eslint-disable-next-line no-constructor-return
    return type;
  }

  static add(...args) {
    DataTypeDefinition.add(...args);
  }

  static exists(...args) {
    return DataTypeDefinition.exists(...args);
  }

  /**
   * Validates passed data type
   * @param {Object} type
   * @param {String} [name]
   * @returns {Object}
   * @throws {DataType.ValidationError}
   */
  static assertType(type, name) {
    if (!this.exists(type)) {
      const error = new Error(`Unknown data type${name ? ` for "${name}"` : ''}`);
      error.name = ERRORS.ValidationError;
      throw error;
    }
    return type;
  }

  /**
   * Validates passed data type
   * @param {Object} type
   * @param {*} value
   * @param {String} name
   * @throws {DataType.ValidationError}
   */
  static assert(type, value, name) {
    this.assertType(type, name);
    DATA_TYPES.get(type).assert(value, name);
  }

  static validate(type, value, name) {
    this.assertType(type, name);
    return DATA_TYPES.get(type).validate(value, name);
  }

  static fromJSON(type, value, name) {
    this.assertType(type, name);
    return DATA_TYPES.get(type).fromJSON(value);
  }

  static toJSON(type, value, name) {
    this.assertType(type, name);
    return DATA_TYPES.get(type).toJSON(value);
  }

  static is(type, value) {
    return !this.validate(type, value);
  }
}

DataType.add(null, value => (value === null ? undefined : 'must be null'));
DataType.add(String, value => (typeof value === 'string' ? undefined : 'must be a string'));
DataType.add(Number, value => (typeof value === 'number' ? undefined : 'must be a number'));
DataType.add(Boolean, value => (typeof value === 'boolean' ? undefined : 'must be a boolean'));
DataType.add(Date, value => (value instanceof Date ? undefined : 'must be a date'));
DataType.add(Set, value => (value instanceof Set ? undefined : 'must be a set'));
DataType.add(Array, value => (Array.isArray(value) ? undefined : 'must be an array'));
DataType.add(DataType, value => (DataType.exists(value) ? undefined : 'must be a data type'));
DataType.add(JSON, value =>
  !enumerate.isEnum(value) && value !== JSON && value instanceof Object && value.constructor === Object
    ? undefined
    : 'must be a plain object'
);

Object.assign(DataType, ERRORS);
