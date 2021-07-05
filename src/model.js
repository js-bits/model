/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import PRIMITIVE_TYPES from './primitive-types.js';
import MODELS from './models-list.js';
import validateValue from './validate-value.js';

const STATIC_PROPS = enumerate`
  ID
  SAME
`;

export default class Model {
  constructor(schema) {
    if (schema) {
      if (typeof schema !== 'object') {
        throw new Error('Invalid model schema');
      }
      const entries = Object.entries(schema);
      if (entries.length === 0) {
        throw new Error('Empty model schema');
      }
      for (const [key, type] of entries) {
        if (!PRIMITIVE_TYPES.has(type) && !MODELS.has(type) && type !== STATIC_PROPS.SAME) {
          throw new Error(`Invalid model schema: unknown data type for "${key}"`);
        }
      }
      // NOTE: encapsulated class definition make it impossible to manipulate data schema from outside the model
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
            if (type === STATIC_PROPS.SAME) {
              schema[key] = NewClass;
            }
            // console.log('validate', propName, type, value);
            const errorMessage = validateValue(type, value, isOptional);
            if (errorMessage) {
              errors.push(`Field "${propName}": ${errorMessage}`);
            }
          }
          return errors;
        }
      }
      MODELS.add(NewClass);
      NewClass.ID = Symbol('Model ID'); // do I really need it
      // Object.freeze(NewClass);
      return NewClass;
    } // else prototype is created
  }
  // parse() {}
  // validate() {}
  // sync() {}
}

Object.assign(Model, STATIC_PROPS);
// Object.freeze(Model);
