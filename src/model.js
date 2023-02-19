/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import Schema from './schema.js';

const MODELS = new WeakSet();

const STATIC_PROPS = enumerate`
  SAME
`;

const ERRORS = enumerate('Model|')`
InvalidDataError
`;

/**
 * @param {Schema} schema
 * @param {Object} data
 * @param {Function} [callback]
 * @returns {Object} - an object representing validation errors
 */
const iterate = (schema, data, callback) => {
  const keys = new Set([...Object.keys(schema), ...Object.keys(data)]);
  for (const propName of keys) {
    const propType = schema[propName];
    const propValue = data[propName];
    callback(propName, propType, propValue);
  }
};

export default class Model {
  static toString() {
    return '[class Model]';
  }

  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return 'Model';
  }

  constructor(config) {
    if (arguments.length) {
      // NOTE: encapsulated class definition makes it impossible to manipulate data schema from outside of the model
      let schema;

      class CustomModel extends Model {
        constructor(data) {
          super();
          CustomModel.assert(data);
          iterate(schema, data, (propName, propType, propValue) => {
            // intentionally set to null for both cases (undefined and null)
            this[propName] = propValue ? DataType.fromJSON(propType, propValue) : null;
          });

          const proxy = new Proxy(this, {
            get(...args) {
              const [target, prop] = args;
              const allowedProps = [Symbol.toPrimitive, Symbol.toStringTag, 'toJSON', 'toString', 'constructor'];
              if (!Object.prototype.hasOwnProperty.call(target, prop) && !allowedProps.includes(prop)) {
                throw new Error(`Property "${String(prop)}" of a Model instance is not accessible`);
              }
              return Reflect.get(...args);
            },
            set(target, prop) {
              throw new Error(`Property assignment is not supported for "${String(prop)}"`);
            },
          });

          // eslint-disable-next-line no-constructor-return
          return proxy;
        }

        /**
         * @param {*} data
         * @returns {Object} - an object representing validation errors
         */
        static validate(data) {
          if (!DataType.is(JSON, data)) {
            const error = new Error('Model data must be a plain object');
            error.name = Model.InvalidDataError;
            throw error;
          }

          const validationResult = {};
          iterate(schema, data, (propName, propType, propValue) => {
            if (propType) {
              const isDefined = !(propValue === undefined || propValue === null);
              if (isDefined) {
                const errors = DataType.validate(propType, propValue);
                if (errors) validationResult[propName] = errors;
              } else if (schema.isRequired(propName)) {
                validationResult[propName] = 'required property is not defined';
              }
            } else {
              validationResult[propName] = 'property is not defined in schema';
            }
          });

          const hasErrors = Object.keys(validationResult).length;
          return hasErrors ? validationResult : undefined;
        }

        static assert(data) {
          const validationResult = CustomModel.validate(data);
          if (validationResult) {
            const error = new Error('Invalid data');
            error.name = Model.InvalidDataError;
            error.cause = validationResult; // TODO: replace with native https://v8.dev/features/error-cause;
            throw error;
          }
        }

        // static toGraphQL() {}
      }

      Object.freeze(CustomModel);

      DataType.add(CustomModel, {
        validate(value) {
          if (DataType.is(JSON, value)) return CustomModel.validate(value);
          return value instanceof CustomModel ? undefined : 'invalid model type';
        },
        fromJSON(data) {
          if (DataType.is(JSON, data)) return new CustomModel(data);
          return data;
        },
        toJSON(value) {
          return value.toJSON();
        },
      });

      class CustomSchema extends Schema {
        initEntry(key, type) {
          return super.initEntry(key, type === Model.SAME ? CustomModel : type);
        }
      }
      schema = new CustomSchema(config);

      // const DataTypeRef = super({
      //   extends: Model,
      //   validate(value) {
      //     return value instanceof NewModel ? undefined : 'must be a specified model';
      //   },
      //   // fromJSON: inputValue => {
      //   //   if (Model.isModel(inputValue) ? DataType.is(JSON, propValue)
      //   //   return new NewModel(inputValue)
      //   // },
      // });

      // NewModel.fromJSON = DataTypeRef.fromJSON;

      // console.log('NewModel.fromJSON', NewModel.fromJSON, DataTypeRef.fromJSON);

      // Move this to StorageModel (extends Model)
      // MODELS.set(NewModel.ID, NewModel);
      MODELS.add(CustomModel);
      // NewModel.ID = Symbol('Model ID'); // do I really need it?
      // NewModel.validateOnInit = true; // by default

      // eslint-disable-next-line no-constructor-return
      return CustomModel;
    } // else prototype is being created
    // super();
  }

  // fromJSON() {}
  // sync() {}
  static isModel(type) {
    return typeof type === 'function' && MODELS.has(type);
  }
}

Schema.add(JSON, rawType => new Model(rawType));

DataType.add(Model, value => (value instanceof Model ? undefined : 'must be a model'));

Object.assign(Model, STATIC_PROPS);
DataType.add(Model.SAME, () => 'Model.SAME must not be use directly');

Object.assign(Model, ERRORS);
Object.freeze(Model);
