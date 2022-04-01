import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';

const prepareSchema = (NewModel, config, flags, Model) => {
  const schema = { ...config };
  const schemaEntries = Object.entries(schema);
  let globalSpecifier;
  let reqIndex = 0;
  let optIndex = 1;
  for (const [key, type] of schemaEntries) {
    let specifier;
    let propName = key;
    const match = key.match(/^(.+)([?!])$/);
    if (match) {
      [, propName, specifier] = match;
      if (globalSpecifier && specifier !== globalSpecifier) {
        const error = new Error('Model schema is invalid. Must contain either ? or ! specifiers');
        error.name = Model.InvalidModelSchemaError;
        throw error;
      }
      if (!globalSpecifier && specifier === '!') {
        flags.reverse();
        reqIndex = 1;
        optIndex = 0;
      }
      globalSpecifier = specifier;
      schema[propName] = schema[key];
      delete schema[key];
    }
    flags[specifier ? optIndex : reqIndex].add(propName);

    if (type === Model.SAME) {
      schema[propName] = NewModel;
    } else if (enumerate.isEnum(type)) {
      DataType.add(type, value => {
        const allowedValues = Object.values(type);
        const x = allowedValues.map(item => String(item)).join(',');
        return allowedValues.includes(value) ? undefined : `must be one of allowed values [${x}]`;
      });
    } else if (DataType.is(JSON, type)) {
      // nested schema
      const AnonymousModel = new Model(type);
      DataType.add(AnonymousModel, value => AnonymousModel.validate(value));
      schema[propName] = AnonymousModel;
    } else if (!DataType.exists(type)) {
      const error = new Error(`Model schema is invalid: data type of "${propName}" property is invalid`);
      error.name = Model.InvalidModelSchemaError;
      throw error;
    }
  }

  return schema;
};

export default prepareSchema;
