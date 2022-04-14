/**
 * This is just a part of Model extracted for convenience
 * @param {Class} Model
 * @param {Object} data
 * @param {Schema} schema
 * @returns {Object}
 */
function assemble(Model, data, schema) {
  const shouldInstantiate = !!this;
  const validationResult = {};
  for (const propName of schema.getKeys(data)) {
    const propType = schema.transformType(propName);
    if (propType) {
      const propValue = data[propName];
      const isDefined = !(propValue === undefined || propValue === null);
      if (isDefined) {
        const errors = schema.validate(propType, propValue);
        if (errors) validationResult[propName] = errors;
      } else if (schema.isRequired(propName)) {
        validationResult[propName] = 'required property is not defined';
      }

      if (shouldInstantiate && !validationResult[propName])
        // intentionally set to null for both cases (undefined and null)
        this[propName] = isDefined ? schema.transformValue(propType, propValue) : null;
    } else {
      validationResult[propName] = 'property is not defined in schema';
    }
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
