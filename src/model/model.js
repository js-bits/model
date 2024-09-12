/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataType from '../data-type/data-type.js';
import freeze from './freeze.js';
import Schema from './schema.js';
import './set.js';

export const MODELS = new WeakSet();

const STATIC_PROPS = enumerate.ts(`
  SAME
`);

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

  static [Symbol.hasInstance](instance) {
    return this.isModel(instance && instance.constructor);
  }

  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return 'Model';
  }

  constructor(...args) {
    // eslint-disable-next-line no-constructor-return
    if (!arguments.length) return this; // prototype is being created

    const CustomModel = this.create(...args);

    // Move this to StorageModel (extends Model)
    // MODELS.set(NewModel.ID, NewModel);
    MODELS.add(CustomModel);
    // NewModel.ID = Symbol('Model ID'); // do I really need it?
    // NewModel.validateOnInit = true; // by default

    // eslint-disable-next-line no-constructor-return
    return CustomModel;
    // super();
  }

  // eslint-disable-next-line class-methods-use-this
  create(config) {
    // NOTE: encapsulated class definition makes it impossible to manipulate data schema from outside of the model
    let schema;

    class CustomModel extends Model {
      static [Symbol.hasInstance](instance) {
        return super[Symbol.hasInstance](instance) && instance.constructor === CustomModel;
      }

      static get schema() {
        // should return raw config to account for 'optional?' fields
        // and to avoid interference between different schemas
        return config;
      }

      constructor(data) {
        super();
        DataType.assert(JSON, data, '<model_data>');
        DataType.assert(CustomModel, data);
        iterate(schema, data, (propName, propType, propValue) => {
          this[propName] = propValue !== undefined ? DataType.fromJSON(propType, propValue) : undefined;
        });

        // eslint-disable-next-line no-constructor-return
        return freeze(this);
      }

      // toString() {
      //   return '';
      // }

      // valueOf() {
      //   return '123';
      // }

      // static toGraphQL() {}
    }

    new DataType(
      {
        validate(value, parentName) {
          if (value instanceof CustomModel) return undefined;
          if (!DataType.is(JSON, value)) return 'invalid model type';

          const validationResult = [];
          iterate(schema, value, (propName, propType, propValue) => {
            const propPath = parentName ? `${parentName}.${propName}` : propName;
            if (propType !== undefined) {
              if (propValue !== undefined) {
                const errors = DataType.validate(propType, propValue, propPath);
                if (errors) validationResult.push(...errors);
              } else if (schema.isRequired(propName)) {
                validationResult.push(`"${propPath}" required property is not defined`);
              }
            } else {
              validationResult.push(`"${propPath}" property is not defined in schema`);
            }
          });

          const hasErrors = validationResult.length;
          return hasErrors ? validationResult : undefined;
        },
        fromJSON(value) {
          if (DataType.is(JSON, value)) return new CustomModel(value);
          return value;
        },
        toJSON(value) {
          return value.toJSON();
        },
      },
      CustomModel
    );

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
    return CustomModel;
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

Object.freeze(Model);
