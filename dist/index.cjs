'use strict';

var enumerate = require('@js-bits/enumerate');

/* eslint-disable max-classes-per-file */

const DATA_TYPES = new Map();

const ERRORS$2 = enumerate('DataType|')`
InvalidDataTypeError
UnknownDataTypeError
`;

class DataType {
  static toString() {
    return '[class DataType]';
  }

  constructor(config) {
    if (arguments.length) {
      let typeDef;

      class _DataType_ extends DataType {
        constructor() {
          const error = new Error('Data type instantiation is not allowed');
          error.name = ERRORS$2.InvalidDataTypeError;
          throw error;
        }

        // name // for GraphQL conversion
        // compare // for sorting

        static fromJSON(inputValue) {
          this.validate(inputValue, true);
          if (typeDef.fromJSON) return typeDef.fromJSON(inputValue);
          return inputValue;
        }

        static toJSON(value) {
          let outputValue = value;
          if (typeDef.toJSON) outputValue = typeDef.toJSON(value);
          this.validate(outputValue, true);
          return outputValue;
        }

        static validate(value, hardCheck) {
          const result = DataType.validate(_DataType_, value);
          if (result && hardCheck) {
            const error = new Error('Data type is invalid');
            error.name = ERRORS$2.InvalidDataTypeError;
            throw error;
          }
          return result;
        }
      }

      typeDef = DataType.add(_DataType_, config);
      // eslint-disable-next-line no-constructor-return
      return _DataType_;
    } // else prototype is being created
  }

  static add(type, config) {
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
      if (Object.prototype.hasOwnProperty.call(config, 'extends')) {
        if (!DataType.exists(config.extends)) {
          const error = new Error('Base data type is invalid');
          error.name = ERRORS$2.InvalidDataTypeError;
          throw error;
        }
        typeDef.extends = config.extends;
      }
      if (
        Object.prototype.hasOwnProperty.call(config, 'fromJSON') ||
        Object.prototype.hasOwnProperty.call(config, 'toJSON')
      ) {
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

    DATA_TYPES.set(type, typeDef);

    return typeDef;
  }

  static exists(type) {
    if (DATA_TYPES.has(type)) return true;
    return false;
  }

  static init(type) {
    if (this.exists(type)) return type;
    if (enumerate.isEnum(type)) {
      DataType.add(type, value => {
        const allowedValues = Object.values(type);
        const list = allowedValues.map(item => String(item)).join(',');
        return allowedValues.includes(value) ? undefined : `must be one of allowed values [${list}]`;
      });
      return type;
    }
  }

  static get(type) {
    const typeDef = DATA_TYPES.get(type);
    if (!typeDef) {
      const error = new Error('Unknown data type');
      error.name = ERRORS$2.UnknownDataTypeError;
      throw error;
    }
    return typeDef;
  }

  /**
   * Validates a value against a given type
   * @param {Object} type
   * @param {*} value
   * @returns {Array}
   */
  static validate(type, value) {
    const typeDef = DataType.get(type);
    let error;
    if (typeDef.extends) {
      error = DataType.validate(typeDef.extends, value);
    }

    // if no error messages from a base validator
    if (!error) {
      const validator = typeDef.validate;
      error = validator(value);
    }

    return error;
  }

  static fromJSON(type, value) {
    if (this.validate(type, value)) {
      throw new Error('Invalid');
    }

    // if (!enumerate.isEnum(propType) && propType.fromJSON)
    const typeDef = DataType.get(type);
    return typeDef.fromJSON ? typeDef.fromJSON(value) : value;
  }

  static is(type, value) {
    return !DataType.validate(type, value);
  }
}

DataType.add(String, value => (typeof value === 'string' ? undefined : 'must be a string'));
DataType.add(Number, value => (typeof value === 'number' ? undefined : 'must be a number'));
DataType.add(Boolean, value => (typeof value === 'boolean' ? undefined : 'must be a boolean'));
DataType.add(Date, value => (value instanceof Date ? undefined : 'must be a date'));
DataType.add(Array, value => (Array.isArray(value) ? undefined : 'must be an array'));
DataType.add(DataType, value =>
  typeof value === 'function' && DataType.exists(DataType) ? undefined : 'must be a data type'
);
DataType.add(JSON, value =>
  !enumerate.isEnum(value) && value !== JSON && value instanceof Object && value.constructor === Object
    ? undefined
    : 'must be a plain object'
);

Object.assign(DataType, ERRORS$2);

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
    const propType = this.initType(type);

    if (!propType) {
      const error = new Error(`Model schema is invalid: data type of "${propName}" property is invalid`);
      error.name = ERRORS$1.InvalidModelSchemaError;
      throw error;
    }
    this[propName] = propType;
  }

  // eslint-disable-next-line class-methods-use-this
  initType(propType) {
    const dynamicSchema = [...DYNAMIC_SCHEMAS.keys()].find(schemaType => DataType.is(schemaType, propType));
    if (dynamicSchema) return DYNAMIC_SCHEMAS.get(dynamicSchema)(propType);
    return DataType.init(propType);
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

/**
 * This is just a part of Model extracted for convenience
 * @param {Class} Model
 * @param {Object} data
 * @param {Schema} schema
 * @returns {Object}
 */
function assemble(Model, data, schema) {
  if (!DataType.is(JSON, data)) {
    const error = new Error('Model data must be a plain object');
    error.name = Model.InvalidDataError;
    throw error;
  }

  const shouldInstantiate = !!this;
  const validationResult = {};
  const keys = new Set([...Object.keys(schema), ...Object.keys(data)]);
  for (const propName of keys) {
    const propType = schema[propName];
    if (propType) {
      const propValue = data[propName];
      const isDefined = !(propValue === undefined || propValue === null);
      if (isDefined) {
        const errors = DataType.validate(propType, propValue);
        if (errors) validationResult[propName] = errors;
      } else if (schema.isRequired(propName)) {
        validationResult[propName] = 'required property is not defined';
      }

      if (shouldInstantiate && !validationResult[propName])
        // intentionally set to null for both cases (undefined and null)
        this[propName] = isDefined ? DataType.fromJSON(propType, propValue) : null;
    } else {
      validationResult[propName] = 'property is not defined in schema';
    }
  }

  const hasErrors = Object.keys(validationResult).length;
  if (shouldInstantiate) {
    if (hasErrors) {
      const error = new Error('Invalid data');
      error.name = Model.InvalidDataError;
      error.cause = validationResult; // TODO: replace with native https://v8.dev/features/error-cause;
      throw error;
    }
    return this;
  }

  return hasErrors ? validationResult : undefined;
}

/* eslint-disable max-classes-per-file */

const MODELS = new WeakSet();

const STATIC_PROPS = enumerate`
  SAME
`;

const ERRORS = enumerate('Model|')`
InvalidDataError
`;

class Model {
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
        fromJSON(data) {
          if (DataType.is(JSON, data)) return new CustomModel(data);
          // if (data instanceof CustomModel)
          return data;
        },
        toJSON() {
          return {};
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

Schema.add(JSON, rawType => new Model(rawType));

DataType.add(Model, value => (value instanceof Model ? undefined : 'must be a model'));

Object.assign(Model, STATIC_PROPS);
DataType.add(Model.SAME, () => 'must not be use directly');

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

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
enumerate`
  ContentModel
  data
  options
`;

const CollectionModel = new Model({
  type: DataType,
  'min?': Number,
  'max?': Number,
});

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

  constructor(ContentType, options) {
    super();

    // if (Model.isModel(Type)) {
    //   this.Model = Type;
    // } else {
    //   this.Model = new Model(Type);
    // }
    // this[ø.data] = new Map();
    /* this[ø.options] = */
    new CollectionModel({
      type: ContentType,
      ...options,
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
  const { contentType, ...options } = shortcut(rawType);
  return new Collection(contentType, options);
});

new Collection(Number);

const EN = enumerate`123`;

new Model({
  name: String,
  type: EN,
  value: String,
  'field?': Model.SAME,
});

exports.Collection = Collection;
exports.DataType = DataType;
exports.Model = Model;
