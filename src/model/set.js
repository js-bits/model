import DataType from '../data-type/data-type.js';
import Schema from './schema.js';

Schema.add(Set, setOfRawTypes => {
  if (setOfRawTypes.size < 2) {
    const error = new Error('At least 2 data types must be specified in a set');
    error.name = Schema.InvalidModelSchemaError;
    throw error;
  }

  const allowedDataTypes = Array.from(setOfRawTypes).map(rawType => Schema.initType(rawType));

  const matchType = (value, name) => {
    const matchingTypes = allowedDataTypes.filter(type => !DataType.validate(type, value));
    if (matchingTypes.length === 1) {
      return matchingTypes[0];
    }
    if (matchingTypes.length > 1) {
      const error = new Error(`A value of "${name}" property matches multiple data types from a set`);
      error.name = Schema.InvalidModelSchemaError;
      throw error;
    }
    return undefined;
  };

  return new DataType({
    validate: (value, name) => {
      if (matchType(value, name)) return undefined;

      const validationResult = allowedDataTypes.reduce((acc, type) => {
        const errors = DataType.validate(type, value);
        if (errors) acc.push(...errors);
        return acc;
      }, []);

      const hasErrors = validationResult.length;
      // remove duplicated messages and concatenate
      return hasErrors
        ? [`"${name}" validation errors: ${Array.from(new Set(validationResult)).join(' or ')}`]
        : undefined;
    },
    fromJSON(value, name) {
      return DataType.fromJSON(matchType(value, name), value, name);
    },
    toJSON(value, name) {
      return DataType.toJSON(matchType(value, name), value, name);
    },
  });
});
