/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import validate from './model-validate.js';

const MODELS = new WeakSet();

const STATIC_PROPS = enumerate`
  SAME
`;

const ERRORS = enumerate(String)`
InvalidModelSchemaError
InvalidDataError
`;

Object.assign(validate, ERRORS);

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
      const schema = { ...config };
      const required = new Set();
      const optional = new Set();
      const flags = [required, optional];
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
          return validate(data, schema, flags[0]);
        }
      }

      let globalSpecifier;
      let reqIndex = 0;
      let optIndex = 1;
      for (const [key, type] of entries) {
        let specifier;
        let propName = key;
        const match = key.match(/^(.+)([?!])$/);
        if (match) {
          [, propName, specifier] = match;
          if (globalSpecifier && specifier !== globalSpecifier) {
            const error = new Error('Model schema is invalid. Must contain either ? or ! specifiers');
            error.name = ERRORS.InvalidModelSchemaError;
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

        if (type === STATIC_PROPS.SAME) {
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
          error.name = ERRORS.InvalidModelSchemaError;
          throw error;
        }
      }

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
