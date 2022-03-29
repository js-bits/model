/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import validateValue from './validate-value.js';

const MODELS = new WeakSet();

const STATIC_PROPS = enumerate`
  SAME
`;

const ERRORS = enumerate(String)`
InvalidModelSchemaError
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
      if (typeof config !== 'object') {
        const error = new Error('Model schema is invalid');
        error.name = ERRORS.InvalidModelSchemaError;
        throw error;
      }
      const schema = { ...config };
      const entries = Object.entries(schema);
      if (entries.length === 0) {
        const error = new Error('Model schema is empty');
        error.name = ERRORS.InvalidModelSchemaError;
        throw error;
      }

      // NOTE: encapsulated class definition makes it impossible to manipulate data schema from outside of the model
      class NewModel extends Model {
        constructor(data) {
          super();
          const validationErrors = NewModel.validate(data);
          if (validationErrors.length > 0) {
            const error = new Error('Invalid data');
            error.cause = validationErrors;
            throw error;
          }
        }

        /**
         * @param {*} data
         * @returns {Array} - an array of validation errors
         */
        static validate(data) {
          const errors = [];
          for (const [key, type] of Object.entries(schema)) {
            const propName = key.replace(/[?]?$/, '');
            const isOptional = propName !== key;
            const value = data[propName];
            const errorMessage = validateValue(type, value, isOptional);
            // console.log('validate', propName, type, value, errorMessage);
            if (errorMessage) {
              errors.push(`Field "${propName}": ${errorMessage}`);
            }
          }
          return errors;
        }
      }

      for (const [key, type] of entries) {
        if (type === STATIC_PROPS.SAME) {
          schema[key] = NewModel;
        } else if (DataType.is(Object, type)) {
          // nested schema
          schema[key] = new Model(type);
        } else if (!DataType.exists(type)) {
          const error = new Error(`Model schema is invalid: data type of "${key}" is invalid`);
          error.name = ERRORS.InvalidModelSchemaError;
          throw error;
        }
      }

      DataType.add(NewModel, value => (value instanceof NewModel ? undefined : 'must be a custom model'), Model);

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

DataType.add(Model, value => (value instanceof Model ? undefined : 'must be a model'), Object);

Object.assign(Model, STATIC_PROPS);
Object.assign(Model, ERRORS);
// Object.freeze(Model);
