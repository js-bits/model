/* eslint-disable max-classes-per-file */
import enumerate from '@js-bits/enumerate';
import DataType from './data-type.js';
import init from './model-init.js';

const MODELS = new WeakSet();

const STATIC_PROPS = enumerate`
  SAME
`;

const ERRORS = enumerate(String)`
InvalidModelSchemaError
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
      if (!DataType.is(JSON, config)) {
        const error = new Error('Model schema is invalid');
        error.name = ERRORS.InvalidModelSchemaError;
        throw error;
      }

      if (Object.keys(config).length === 0) {
        const error = new Error('Model schema is empty');
        error.name = ERRORS.InvalidModelSchemaError;
        throw error;
      }

      const NewModel = init(Model, config);

      // Move this to StorageModel (extends Model)
      // MODELS.set(NewModel.ID, NewModel);
      MODELS.add(NewModel);
      // NewModel.ID = Symbol('Model ID'); // do I really need it?
      // NewModel.validateOnInit = true; // by default

      // eslint-disable-next-line no-constructor-return
      return NewModel;
    } // else prototype is being created
  }

  // fromJSON() {}
  // sync() {}
  static isModel(type) {
    return typeof type === 'function' && MODELS.has(type);
  }
}

DataType.add(Model, value => (value instanceof Model ? undefined : 'must be a model'));

Object.assign(Model, STATIC_PROPS);
Object.assign(Model, ERRORS);
Object.freeze(Model);
