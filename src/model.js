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
      const CustomModel = this.construct(config);

      DataType.add(CustomModel, {
        extends: Model,
        validate(value) {
          return value instanceof CustomModel ? undefined : 'invalid model type';
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
      MODELS.add(CustomModel);
      // NewModel.ID = Symbol('Model ID'); // do I really need it?
      // NewModel.validateOnInit = true; // by default

      // eslint-disable-next-line no-constructor-return
      return CustomModel;
    } // else prototype is being created
    // super();
  }

  construct(config) {
    let CustomModel;
    // eslint-disable-next-line no-use-before-define
    class Schema extends BaseSchema.getGlobalSchema() {
      transformType(propName) {
        const propType = super.transformType(propName);
        if (propType === Model.SAME) return CustomModel;
        return propType;
      }
    }

    CustomModel = create(this.constructor, new Schema(config));
    return CustomModel;
  }

  // fromJSON() {}
  // sync() {}
  static isModel(type) {
    return typeof type === 'function' && MODELS.has(type);
  }
}

export class Schema extends BaseSchema {
  initType(propType) {
    if (propType === Model.SAME) return Model.SAME;
    if (DataType.is(JSON, propType)) return new Model(propType);
    // if (Model.isModel(propType) && !DataType.exists(propType)) {
    //   return propType;
    // }
    return super.initType(propType);
  }

  validateEntry(propType, propValue) {
    if (Model.isModel(propType) && DataType.is(JSON, propValue)) return propType.validate(propValue);
    return super.validateEntry(propType, propValue);
  }

  transformValue(PropType, propValue) {
    if (Model.isModel(PropType) && DataType.is(JSON, propValue)) return new PropType(propValue);
    return super.transformValue(PropType, propValue);
  }
}

BaseSchema.setGlobalSchema(Schema);

DataType.add(Model, value => (value instanceof Model ? undefined : 'must be a model'));

Object.assign(Model, STATIC_PROPS);
Object.assign(Model, ERRORS);
Object.freeze(Model);
