import DataType from './data-type.js';

/**
 * This is just a part of Model extracted for convenience
 * @param {Class} Model
 * @param {Object} data
 * @param {Schema} schema
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
    const propType = schema.transformType(propName);
    const propValue = data[propName];
    let returnValue = null; // intentionally set to null for both cases (undefined and null)
    if (!propType) {
      validationResult[propName] = 'property is not defined in schema';
    } else if (propValue === undefined || propValue === null) {
      if (schema.isRequired(propName)) {
        validationResult[propName] = 'required property is not defined';
      }
    } else {
      const errors = schema.validate(propType, propValue);
      if (errors) {
        validationResult[propName] = errors;
      } else if (shouldInstantiate) {
        returnValue = schema.transformValue(propType, propValue);
      }
    }

    if (shouldInstantiate && !validationResult[propName]) this[propName] = returnValue;
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
