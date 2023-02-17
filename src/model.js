/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import BaseSchema from './schema.js';
import assemble from './model-assemble.js';

const MODELS = new WeakSet();

const STATIC_PROPS = enumerate`
  SAME
`;

const ERRORS = enumerate(String)`
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
    if (arguments.length) {
      // NOTE: encapsulated class definition makes it impossible to manipulate data schema from outside of the model
      let schema;

      class CustomModel extends Model {
        constructor(data) {
          super();
          this.assemble(data);

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

        assemble(data) {
          assemble.call(this, CustomModel, data, schema);
        }

        /**
         * @param {*} data
         * @returns {Object} - an object representing validation errors
         */
        static validate(data) {
          return assemble(CustomModel, data, schema);
        }

        // static toGraphQL() {}
      }

      Object.freeze(CustomModel);

      DataType.add(CustomModel, {
        validate(value) {
          if (DataType.is(JSON, value)) return CustomModel.validate(value);
          return value instanceof CustomModel ? undefined : 'invalid model type';
        },
      });

      class Schema extends BaseSchema.getGlobalSchema() {
        initEntry(key, type) {
          return super.initEntry(key, type === Model.SAME ? CustomModel : type);
        }
      }
      schema = new Schema(config);

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

      // DataType.add(NewModel, DataType.get(DataTypeRef));

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

export class Schema extends BaseSchema {
  initType(type) {
    if (DataType.is(JSON, type)) return new Model(type);
    return super.initType(type);
  }

  transformValue(Type, value) {
    if (Model.isModel(Type) && DataType.is(JSON, value)) return new Type(value);
    return super.transformValue(Type, value);
  }
}

BaseSchema.setGlobalSchema(Schema);

DataType.add(Model, value => (value instanceof Model ? undefined : 'must be a model'));

Object.assign(Model, STATIC_PROPS);
DataType.add(Model.SAME, () => 'must not be use directly');

Object.assign(Model, ERRORS);
Object.freeze(Model);
