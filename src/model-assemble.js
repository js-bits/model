import DataType from './data-type.js';

/**
 * This is just a part of Model extracted for convenience
 * @param {Object} data
 * @param {Object} schema
 * @param {Array} required
 * @param {Class} Model
 * @returns {Object}
 */
const assemble = (Model, data, schema, required, instance) => {
  if (!DataType.is(JSON, data)) {
    const error = new Error('Model data must be a plain object');
    error.name = Model.InvalidDataError;
    throw error;
  }

  const validationResult = {};
  const properties = new Set([...Object.keys(schema), ...Object.keys(data)]);
  for (const propName of properties) {
    const PropType = schema[propName];
    let propValue = data[propName];
    if (propValue === undefined || propValue === null) {
      if (required.has(propName)) {
        validationResult[propName] = 'required property is not defined';
      } else {
        propValue = null; // intentionally set to null for both cases
      }
    } else if (PropType) {
      let result;
      if (Model.isModel(PropType) && DataType.is(JSON, propValue)) {
        result = PropType.validate(propValue);
        if (!result && instance) propValue = new PropType(propValue);
      } else {
        result = DataType.validate(PropType, propValue);
      }
      if (result) validationResult[propName] = result;
    } else {
      validationResult[propName] = 'property is not defined in schema';
    }

    if (instance && !validationResult[propName]) instance[propName] = propValue;
  }

  const hasErrors = Object.keys(validationResult).length;
  if (instance) {
    if (hasErrors) {
      const error = new Error('Invalid data');
      error.name = Model.InvalidDataError;
      error.cause = validationResult; // TODO: replace with native https://v8.dev/features/error-cause;
      throw error;
    }
    return instance;
  }

  return hasErrors ? validationResult : undefined;
};

export default assemble;