/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import validate from './model-validate.js';
import prepareSchema from './model-schema.js';

const MODELS = new WeakSet();

const STATIC_PROPS = enumerate`
  SAME
`;

const ERRORS = enumerate(String)`
InvalidModelSchemaError
InvalidDataError
`;

export default class Model {
  static toString() {
    return '[class Model]';
  }

  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return 'Model';
  }

  constructor(config) {
    if (config) {
      if (!DataType.is(JSON, config)) {
        const error = new Error('Model schema is invalid');
        error.name = ERRORS.InvalidModelSchemaError;
        throw error;
      }
      const required = new Set();
      const optional = new Set();
      const flags = [required, optional];
      if (Object.keys(config).length === 0) {
        const error = new Error('Model schema is empty');
        error.name = ERRORS.InvalidModelSchemaError;
        throw error;
      }

      let schema;

      // NOTE: encapsulated class definition makes it impossible to manipulate data schema from outside of the model
      class NewModel extends Model {
        constructor(data) {
          super();
          const errors = NewModel.validate(data);
          if (errors) {
            const error = new Error('Invalid data');
            error.name = ERRORS.InvalidDataError;
            error.cause = errors; // TODO: replace with native https://v8.dev/features/error-cause;
            throw error;
          }
        }

        /**
         * @param {*} data
         * @returns {Object} - an object representing validation errors
         */
        static validate(data) {
          return validate(data, schema, flags[0], Model);
        }
      }

      schema = prepareSchema(NewModel, config, flags, Model);

      DataType.add(NewModel, {
        extends: Model,
        validate(value) {
          return value instanceof NewModel ? undefined : 'must be a specified model';
        },
      });

      MODELS.add(NewModel);
      // NewModel.ID = Symbol('Model ID'); // do I really need it?
      // Object.freeze(NewModel);
      return NewModel;
    } // else prototype is created
  }

  // parse() {}
  // validate() {}
  // sync() {}
  static isModel(type) {
    return typeof type === 'function' && MODELS.has(type);
  }
}

DataType.add(Model, value => (value instanceof Model ? undefined : 'must be a model'));


Object.assign(Model, STATIC_PROPS);
Object.assign(Model, ERRORS);
// Object.freeze(Model);
