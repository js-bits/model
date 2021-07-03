/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';

const PRIMITIVE_TYPES = new WeakMap();
PRIMITIVE_TYPES.set(String, value => typeof value === 'string');
PRIMITIVE_TYPES.set(Number, value => typeof value === 'number');
PRIMITIVE_TYPES.set(Boolean, value => typeof value === 'boolean');
PRIMITIVE_TYPES.set(Date, value => value instanceof Date);

const MODELS = new WeakSet();

const STATIC_PROPS = enumerate`
  ID
  SAME
`;

const validateValue = (type, value, isOptional) => {
  // console.log('validate', propName, type, value);
  if (PRIMITIVE_TYPES.has(type)) {
    if (typeof value === 'undefined' || value === null) {
      if (!isOptional) {
        return `Required field is not defined`;
      }
    } else if (!PRIMITIVE_TYPES.get(type)(value)) {
      return `Invalid value`;
    }
  } else if (MODELS.has(type)) {
    if (!(value instanceof type)) {
      return `Invalid value type`;
    }
  }
};

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

export class PrimitiveType {
  constructor(type, validator) {
    class NewClass extends PrimitiveType {}
    PRIMITIVE_TYPES.set(NewClass, value => {
      if (PRIMITIVE_TYPES.get(type)(value)) {
        return validator(value);
      }
      return false;
    });
    return NewClass;
  }
}
