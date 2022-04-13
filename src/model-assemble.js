import DataType from './data-type.js';

/**
 * This is just a part of Model extracted for convenience
 * @param {Class} Model
 * @param {Object} data
 * @param {Object} schema
 * @returns {Object}
 */
function assemble(Model, data, schema) {
  if (!DataType.is(JSON, data)) {
    const error = new Error('Model data must be a plain object');
    error.name = Model.InvalidDataError;
    throw error;
  }

  const shouldInstantiate = !!this;
  const validationResult = {};
  const properties = new Set([...Object.keys(schema), ...Object.keys(data)]);
  for (const propName of properties) {
    const PropType = schema.transformType(propName);
    let propValue = data[propName];
    if (propValue === undefined || propValue === null) {
      if (schema.isRequired(propName)) {
        validationResult[propName] = 'required property is not defined';
      } else {
        propValue = null; // intentionally set to null for both cases
      }
    } else if (PropType) {
      let errors;
      if (Model.isModel(PropType) && DataType.is(JSON, propValue)) {
        errors = PropType.validate(propValue);
        if (!errors && shouldInstantiate) propValue = new PropType(propValue);
      } else {
        errors = DataType.validate(PropType, propValue);
        if (!errors && shouldInstantiate && DataType.is(DataType, PropType)) propValue = PropType.fromJSON(propValue);
      }
      if (errors) validationResult[propName] = errors;
    } else {
      validationResult[propName] = 'property is not defined in schema';
    }

    if (shouldInstantiate && !validationResult[propName]) this[propName] = propValue;
  }

  const hasErrors = Object.keys(validationResult).length;
  if (shouldInstantiate) {
    if (hasErrors) {
      const error = new Error('Invalid data');
      error.name = Model.InvalidDataError;
      error.cause = validationResult; // TODO: replace with native https://v8.dev/features/error-cause;
      throw error;
    }
    return this;
  }

  return hasErrors ? validationResult : undefined;
}

export default assemble;
