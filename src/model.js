/* eslint-disable max-classes-per-file */

const PRIMITIVE_TYPES = new WeakMap();
PRIMITIVE_TYPES.set(String, value => typeof value === 'string');
PRIMITIVE_TYPES.set(Number, value => typeof value === 'number');
PRIMITIVE_TYPES.set(Boolean, value => typeof value === 'boolean');
PRIMITIVE_TYPES.set(Date, value => value instanceof Date);

export default class Model {
  constructor(schema) {
    if (schema) {
      // NOTE: encapsulated class definition make it impossible to manipulate data schema from outside the model
      class NewClass extends Model {
        constructor(data) {
          super();
          if (!NewClass.validate(data)) throw new Error('Invalid data');
        }

        static validate(data) {
          const result = true;
          for (const [key, type] of Object.entries(schema)) {
            const propName = key.replace(/[?]?$/, '');
            const isOptional = key.endsWith('?');
            const value = data[propName];
            console.log('validate', propName, type, value);
            if (PRIMITIVE_TYPES.has(type)) {
              if (isOptional && (typeof value === 'undefined' || value === null)) {
                return true;
              }
              if (!PRIMITIVE_TYPES.get(type)(value)) {
                return false;
              }
            } else {
              throw new Error('Unknown Model type');
            }
          }
          // TODO: return an array of error messages
          return true;
        }
      }
      NewClass.ID = Symbol('Model ID'); // do I really need it
      // Object.freeze(NewClass);
      return NewClass;
    }
  }
}

Model.ID = Symbol('Model ID');
Object.freeze(Model);

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
