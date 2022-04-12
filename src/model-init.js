import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import create from './model-create.js';
import { processKey } from './schema.js';

/**
 * This is just a part of Model extracted for convenience
 * @param {Class} Model
 * @param {Object} config
 * @returns {Model}
 */
function init(Model, config) {
  const schema = {};
  const NewModel = create(Model, schema);

  for (const [key, type] of Object.entries(config)) {
    const propName = processKey.call(null, Model, schema, key);
    schema[propName] = type;

    if (type === Model.SAME) {
      schema[propName] = NewModel;
    } else if (enumerate.isEnum(type)) {
      DataType.add(type, value => {
        const allowedValues = Object.values(type);
        const list = allowedValues.map(item => String(item)).join(',');
        return allowedValues.includes(value) ? undefined : `must be one of allowed values [${list}]`;
      });
    } else if (Array.isArray(type)) {
      schema[propName] = []; // new Model(type)
    } else if (DataType.is(JSON, type)) {
      // nested schema
      schema[propName] = new Model(type);
    } else if (!DataType.exists(type)) {
      const error = new Error(`Model schema is invalid: data type of "${propName}" property is invalid`);
      error.name = Model.InvalidModelSchemaError;
      throw error;
    }
  }

  Object.freeze(schema);

  DataType.add(NewModel, {
    extends: Model,
    validate(value) {
      return value instanceof NewModel ? undefined : 'invalid model type';
    },
  });

  return NewModel;
}

export default init;
