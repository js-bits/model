import DataType from './data-type.js';

/**
 * This is just a part of Model extracted for convenience
 * @param {Object} data
 * @param {Object} schema
 * @param {Array} required
 * @param {Class} Model
 * @returns {Object}
 */
const validate = (data, schema, required, Model) => {
  if (!DataType.is(JSON, data)) {
    const error = new Error('Model data must be a plain object');
    error.name = Model.InvalidDataError;
    throw error;
  }

  const validationResult = {};
  const properties = new Set([...Object.keys(schema), ...Object.keys(data)]);
  for (const propName of properties) {
    const PropType = schema[propName];
    const propValue = data[propName];
    if (propValue === undefined || propValue === null) {
      if (required.has(propName)) {
        validationResult[propName] = 'required property is not defined';
      }
    } else if (PropType) {
      let result;
      if (Model.isModel(PropType) && DataType.is(JSON, propValue)) {
        result = PropType.validate(propValue);
      } else {
        result = DataType.validate(PropType, propValue);
      }
      if (result) validationResult[propName] = result;
    } else {
      validationResult[propName] = 'property is not defined in schema';
    }
  }

  return Object.keys(validationResult).length ? validationResult : undefined;
};

export default validate;
