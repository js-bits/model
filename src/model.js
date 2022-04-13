/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import BaseSchema from './schema.js';
import create from './model-create.js';

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
      let NewModel;

      // eslint-disable-next-line no-use-before-define
      class Schema extends ModelSchema {
        processType(propType) {
          if (propType === Model.SAME) return Model.SAME;
          return super.processType(propType);
        }

        getType(propName) {
          const propType = super.getType(propName);
          if (propType === Model.SAME) return NewModel;
          return propType;
        }
      }

      NewModel = create(Model, new Schema(config));

      DataType.add(NewModel, {
        extends: Model,
        validate(value) {
          return value instanceof NewModel ? undefined : 'invalid model type';
        },
      });

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
      MODELS.add(NewModel);
      // NewModel.ID = Symbol('Model ID'); // do I really need it?
      // NewModel.validateOnInit = true; // by default

      // eslint-disable-next-line no-constructor-return
      return NewModel;
    } // else prototype is being created
    // super();
  }

  // fromJSON() {}
  // sync() {}
  static isModel(type) {
    return typeof type === 'function' && MODELS.has(type);
  }
}

class ModelSchema extends BaseSchema {
  processType(propType) {
  if (DataType.is(JSON, propType)) return new Model(propType);
    // if (Model.isModel(propType) && !DataType.exists(propType)) {
    //   return propType;
    // }
    return super.processType(propType);
  }
}

DataType.add(Model, value => (value instanceof Model ? undefined : 'must be a model'));

Object.assign(Model, STATIC_PROPS);
Object.assign(Model, ERRORS);
Object.freeze(Model);
