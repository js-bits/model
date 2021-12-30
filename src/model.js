/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import validateValue from './validate-value.js';

const STATIC_PROPS = enumerate`
  SAME
`;

const MODELS = new WeakSet();

export default class Model {
  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return 'Model';
  }

  constructor(config) {
    if (config) {
      if (typeof config !== 'object') {
        throw new Error('Invalid model schema');
      }
      const schema = { ...config };
      const entries = Object.entries(schema);
      if (entries.length === 0) {
        throw new Error('Empty model schema');
      }

      // NOTE: encapsulated class definition makes it impossible to manipulate data schema from outside the model
      class NewClass extends Model {
        constructor(data) {
          super();
          const validationErrors = NewClass.validate(data);
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
          schema[key] = NewClass;
        } else if (!DataType.exists(type)) {
          throw new Error(`Invalid model schema: unknown data type for "${key}"`);
        }
      }

      DataType.add(NewClass, value => (value instanceof NewClass ? undefined : 'must be a custom model'), Model);

      MODELS.add(NewClass);
      // NewClass.ID = Symbol('Model ID'); // do I really need it?
      // Object.freeze(NewClass);
      return NewClass;
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
// Object.freeze(Model);
