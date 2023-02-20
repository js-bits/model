'use strict';

var enumerate = require('@js-bits/enumerate');

/* eslint-disable max-classes-per-file */

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø$1 = enumerate`
  typeDef
`;

const ERRORS$2 = enumerate('DataType|')`
  InvalidDataTypeError
`;

const DATA_TYPES = new Map();

const hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

class DataTypeDefinition {
  static toString() {
    return '[class DataTypeDefinition]';
  }

  constructor(config) {
    // eslint-disable-next-line no-constructor-return
    if (!arguments.length) return this; // prototype is being created

    let validator;
    if (typeof config === 'function') {
      validator = config;
    } else if (config && typeof config === 'object' && typeof config.validate === 'function') {
      validator = config.validate;
    }
    if (!validator) {
      const error = new Error('Data type is invalid');
      error.name = ERRORS$2.InvalidDataTypeError;
      throw error;
    }

    const typeDef = {
      validate: validator,
    };

    if (typeof config === 'object') {
      if (hasOwn(config, 'extends')) {
        if (!DATA_TYPES.has(config.extends)) {
          const error = new Error('Base data type is invalid');
          error.name = ERRORS$2.InvalidDataTypeError;
          throw error;
        }
        typeDef.extends = config.extends;
      }
      if (hasOwn(config, 'fromJSON') || hasOwn(config, 'toJSON')) {
        if (typeof config.fromJSON !== 'function' || typeof config.toJSON !== 'function') {
          const error = new Error('Both "fromJSON" and "toJSON" must defined as functions');
          error.name = ERRORS$2.InvalidDataTypeError;
          throw error;
        }
        typeDef.fromJSON = config.fromJSON;
        typeDef.toJSON = config.toJSON;
      }
    }

    Object.freeze(typeDef);

    this[ø$1.typeDef] = typeDef;

    // name // for GraphQL conversion
    // compare // for sorting
  }

  fromJSON(inputValue) {
    this.assert(inputValue);
    if (hasOwn(this[ø$1.typeDef], 'fromJSON')) return this[ø$1.typeDef].fromJSON(inputValue);
    return inputValue;
  }

  toJSON(value) {
    let outputValue = value;
    if (hasOwn(this[ø$1.typeDef], 'toJSON')) outputValue = this[ø$1.typeDef].toJSON(value);
    this.assert(outputValue);
    return outputValue;
  }

  validate(value) {
    if (hasOwn(this[ø$1.typeDef], 'extends')) {
      const error = DATA_TYPES.get(this[ø$1.typeDef].extends).validate(value);
      if (error) return error;
    }
    // if no error messages from a base validator
    return this[ø$1.typeDef].validate(value);
  }

  assert(value) {
    const result = this.validate(value);
    if (result) {
      const error = new Error('Data is invalid');
      error.name = ERRORS$2.InvalidDataTypeError;
      error.cause = result;
      throw error;
    }
  }
}

/* eslint-disable max-classes-per-file */

const createNewDataType = () => {
  class CustomDataType extends DataTypeDefinition {
    constructor() {
      super();
      const error = new Error('Data type instantiation is not allowed');
      error.name = ERRORS$2.InvalidDataTypeError;
      throw error;
    }
  }
  return CustomDataType;
};

class DataType {
  static toString() {
    return '[class DataType]';
  }

  constructor(config, type = createNewDataType()) {
    // eslint-disable-next-line no-constructor-return, constructor-super
    if (!arguments.length) return this; // prototype is being created

    // expose useful methods
    ['validate', 'fromJSON', 'toJSON', 'is'].forEach(method => {
      type[method] = value => DataType[method](type, value);
    });
    Object.freeze(type);
    DataType.add(type, config);
    // eslint-disable-next-line no-constructor-return
    return type;
  }

  static add(type, config) {
    DATA_TYPES.set(type, new DataTypeDefinition(config));
  }

  static exists(type) {
    if (DATA_TYPES.has(type)) return true;
    if (enumerate.isEnum(type)) {
      DataType.add(type, value => {
        const allowedValues = Object.values(type);
        const list = allowedValues.map(item => String(item)).join(',');
        return allowedValues.includes(value) ? undefined : `must be one of allowed values [${list}]`;
      });
      return true;
    }
    return false;
  }

  /**
   * Validates passed data type
   * @param {Object} type
   * @throws {InvalidDataTypeError}
   */
  static assert(type, value) {
    if (!this.exists(type)) {
      const error = new Error('Unknown data type');
      error.name = ERRORS$2.InvalidDataTypeError;
      throw error;
    }
    if (arguments.length === 2) {
      DATA_TYPES.get(type).assert(value);
    }
  }

  static validate(type, value) {
    this.assert(type);
    return DATA_TYPES.get(type).validate(value);
  }

  static fromJSON(type, value) {
    this.assert(type);
    return DATA_TYPES.get(type).fromJSON(value);
  }

  static toJSON(type, value) {
    this.assert(type);
    return DATA_TYPES.get(type).toJSON(value);
  }

  static is(type, value) {
    return !this.validate(type, value);
  }
}

DataType.add(String, value => (typeof value === 'string' ? undefined : 'must be a string'));
DataType.add(Number, value => (typeof value === 'number' ? undefined : 'must be a number'));
DataType.add(Boolean, value => (typeof value === 'boolean' ? undefined : 'must be a boolean'));
DataType.add(Date, value => (value instanceof Date ? undefined : 'must be a date'));
DataType.add(Array, value => (Array.isArray(value) ? undefined : 'must be an array'));
DataType.add(DataType, value => (DataType.exists(value) ? undefined : 'must be a data type'));
DataType.add(JSON, value =>
  !enumerate.isEnum(value) && value !== JSON && value instanceof Object && value.constructor === Object
    ? undefined
    : 'must be a plain object'
);

Object.assign(DataType, ERRORS$2);

// const MODEL_PROPS = [Symbol.toPrimitive, Symbol.toStringTag, 'toJSON', 'toString', 'constructor'];
const ARRAY_MEMBERS = ['length', 'forEach'];

/**
 * @param {Map} propMap
 */
var freeze = (model, data) =>
  new Proxy(model, {
    get(...args) {
      const key = args[1];
      if (hasOwn(data, key) || ARRAY_MEMBERS.includes(key)) {
        return data[key];
      }
      return Reflect.get(...args);
    },
    has(...args) {
      const key = args[1];
      return Reflect.has(...args) || hasOwn(data, key);
    },
    ownKeys() {
      return Object.keys(data);
    },
    getOwnPropertyDescriptor(...args) {
      const key = args[1];
      if (hasOwn(data, key))
        return {
          writable: false,
          enumerable: true,
          configurable: true,
        };
      return Reflect.getOwnPropertyDescriptor(...args);
    },
    set() {
      return false;
    },
    deleteProperty() {
      return false;
    },
    defineProperty() {
      return false;
    },
  });

const ERRORS$1 = enumerate('Schema|')`
InvalidModelSchemaError
InvalidDataError
`;

const REQUIRED_FIELD_SPECIFIER = '!';
const OPTIONAL_FIELD_SPECIFIER = '?';
const FIELD_NAME_REGEXP = /^(.+)([?!])$/;

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate`
required
requiredFlag
`;

const DYNAMIC_SCHEMAS = new Map();

/**
 * Supports only primitive data types (defined with DataType class) by default
 */
class Schema {
  constructor(config) {
    if (!DataType.is(JSON, config)) {
      const error = new Error('Model schema is invalid');
      error.name = ERRORS$1.InvalidModelSchemaError;
      throw error;
    }

    if (Object.keys(config).length === 0) {
      const error = new Error('Model schema is empty');
      error.name = ERRORS$1.InvalidModelSchemaError;
      throw error;
    }

    this[ø.required] = {};
    for (const [key, type] of Object.entries(config)) {
      this.initEntry(key, type);
    }

    Object.freeze(this);
  }

  initEntry(key, type) {
    const propName = this.initKey(key);
    const propType = Schema.initType(type);

    if (!propType) {
      const error = new Error(`Model schema is invalid: data type of "${propName}" property is invalid`);
      error.name = ERRORS$1.InvalidModelSchemaError;
      throw error;
    }
    this[propName] = propType;
  }

  static initType(propType) {
    const dynamicSchema = [...DYNAMIC_SCHEMAS.keys()].find(schemaType => DataType.is(schemaType, propType));
    if (dynamicSchema) return DYNAMIC_SCHEMAS.get(dynamicSchema)(propType);
    return DataType.exists(propType) ? propType : undefined;
  }

  initKey(key) {
    let specifier;
    let propName = key;
    const globalFlag = this[ø.requiredFlag];
    const match = key.match(FIELD_NAME_REGEXP);
    if (match) {
      [, propName, specifier] = match;
      if (
        globalFlag !== undefined &&
        specifier !== (globalFlag ? REQUIRED_FIELD_SPECIFIER : OPTIONAL_FIELD_SPECIFIER)
      ) {
        const error = new Error(
          `Model schema is invalid. Must contain either ${OPTIONAL_FIELD_SPECIFIER} or ${REQUIRED_FIELD_SPECIFIER} specifiers`
        );
        error.name = Schema.InvalidModelSchemaError;
        throw error;
      }
      this[ø.requiredFlag] = specifier === REQUIRED_FIELD_SPECIFIER;
    }
    this[ø.required][propName] = !specifier;

    return propName;
  }

  isRequired(name) {
    return this[ø.required][name] === !this[ø.requiredFlag];
  }

  static add(type, typeDef) {
    DYNAMIC_SCHEMAS.set(type, typeDef);
  }
}

Object.assign(Schema, ERRORS$1);
Object.freeze(Schema);

/* eslint-disable max-classes-per-file */

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

class Model {
  static toString() {
    return '[class Model]';
  }

  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return 'Model';
  }

  constructor(config) {
    // eslint-disable-next-line no-constructor-return
    if (!arguments.length) return this; // prototype is being created

    // NOTE: encapsulated class definition makes it impossible to manipulate data schema from outside of the model
    let schema;

    class CustomModel extends Model {
      constructor(data) {
        super();
        if (!DataType.is(JSON, data)) {
          const error = new Error('Model data must be a plain object'); // TODO: fix message dupes
          error.name = Model.InvalidDataError;
          throw error;
        }

        DataType.assert(CustomModel, data);
        const store = {};
        iterate(schema, data, (propName, propType, propValue) => {
          // intentionally set to null for both cases (undefined and null)
          store[propName] = propValue ? DataType.fromJSON(propType, propValue) : null;
        });

        // eslint-disable-next-line no-constructor-return
        return freeze(this, store);
      }

      // static toGraphQL() {}
    }

    new DataType(
      {
        validate(value) {
          if (value instanceof CustomModel) return undefined;
          if (!DataType.is(JSON, value)) return 'invalid model type';

          const validationResult = {};
          iterate(schema, value, (propName, propType, propValue) => {
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

    // Move this to StorageModel (extends Model)
    // MODELS.set(NewModel.ID, NewModel);
    MODELS.add(CustomModel);
    // NewModel.ID = Symbol('Model ID'); // do I really need it?
    // NewModel.validateOnInit = true; // by default

    // eslint-disable-next-line no-constructor-return
    return CustomModel;
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

var shortcut = array => {
  const [contentType, ...rest] = array;
  let options;
  if (array.length > 1) {
    [options] = rest;
    const isOptionsObjectValid = array.length === 2 && DataType.is(JSON, options) && options !== contentType;
    if (!isOptionsObjectValid || array.length > 2) {
      const max = rest.reduce((count, item) => count + (item === undefined ? 1 : 0), 1);
      const min = rest.reduce((count, item) => count + (item === contentType ? 1 : 0), 1);
      if (max === array.length) {
        options = {
          max: array.length,
        };
      } else if (min === array.length) {
        options = {
          min,
          max: array.length,
        };
      } else {
        const error = new Error('Invalid collection shortcut');
        error.name = DataType.InvalidDataTypeError;
        throw error;
      }
    }
  }
  return {
    type: contentType,
    ...options,
  };
};

/* eslint-disable max-classes-per-file */

const Options = new Model({
  'min?': Number,
  'max?': Number,
});

// const INDEX = Symbol('INDEX');

// const Model1 = new Model({
//   values: [new Union(Number, String, null)], // multiple types ( Number | String | null )
// });

class Collection extends Model {
  static toString() {
    return '[class Collection]';
  }

  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return 'Collection';
  }

  constructor(type, config = {}) {
    super();
    // eslint-disable-next-line no-constructor-return
    if (!arguments.length) return this; // prototype is being created

    const ContentType = Schema.initType(type);
    const options = new Options(config);

    class CustomCollection extends Collection {
      constructor(data) {
        super();
        if (!DataType.is(Array, data)) {
          const error = new Error('Model data must be a array'); // TODO: fix message dupes
          error.name = Model.InvalidDataError;
          throw error;
        }

        DataType.assert(CustomCollection, data);

        const propMap = data.reduce((map, item, index) => {
          map.set(String(index), DataType.fromJSON(ContentType, item));
          return map;
        }, new Map());

        // eslint-disable-next-line no-constructor-return
        return freeze(this, propMap);
      }

      // static toGraphQL() {}
    }

    new DataType(
      {
        /**
         * @param {Array} value
         */
        validate(value) {
          if (value instanceof CustomCollection) return undefined;
          if (!DataType.is(Array, value)) return 'invalid collection type';

          const validationResult = {};

          value.forEach((item, index) => {
            const error = DataType.validate(ContentType, item);
            if (error) {
              validationResult[index] = error;
            }
          });

          if (options.max && value.length > options.max) {
            validationResult.size = `must be less then or equal to ${options.max}`;
          } else if (options.min && value.length < options.min) {
            validationResult.size = `must be equal to or more then ${options.min}`;
          }

          const hasErrors = Object.keys(validationResult).length;
          return hasErrors ? validationResult : undefined;
        },
        fromJSON(value) {
          if (DataType.is(Array, value)) return new CustomCollection(value);
          return value;
        },
        toJSON(value) {
          return value.toJSON();
        },
      },
      CustomCollection
    );

    // eslint-disable-next-line no-constructor-return
    return CustomCollection;
  }

  // add(item) {
  //   if (item instanceof this.Model) {
  //     // test
  //   }
  //   return this;
  // }

  // get(id) {
  //   return this[ø.data].get(id);
  // }

  // delete(id) {
  //   this[ø.data].delete(id);
  //   return this;
  // }
}

Schema.add(Array, rawType => {
  const { type, ...options } = shortcut(rawType);
  return new Collection(type, options);
});

exports.Collection = Collection;
exports.DataType = DataType;
exports.Model = Model;
