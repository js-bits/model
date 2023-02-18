/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataTypeDefinition, { ERRORS } from './data-type-definition.js';

export default class DataType extends DataTypeDefinition {
  static toString() {
    return '[class DataType]';
  }

  constructor(config) {
    // eslint-disable-next-line no-constructor-return, constructor-super
    if (!arguments.length) return super(); // prototype is being created

    const CustomDataType = super(config);
    // const CustomDataType = new ;
    DataTypeDefinition.add(CustomDataType, CustomDataType);
    // eslint-disable-next-line no-constructor-return
    return CustomDataType;
  }

  static add(type, config) {
    DataTypeDefinition.add(type, new DataTypeDefinition(config));
  }

  static exists(type) {
    if (DataTypeDefinition.exists(type)) return true;
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
