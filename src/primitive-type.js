/* eslint-disable max-classes-per-file */
import PRIMITIVE_TYPES from './primitive-types.js';

export default class PrimitiveType {
  constructor(validator, baseType) {
    if (typeof validator !== 'function') {
      throw new Error('Invalid validator');
    }
    let baseValidator;
    if (typeof baseType !== 'undefined') {
      baseValidator = PRIMITIVE_TYPES.get(baseType);
      if (!baseValidator) {
        throw new Error('Unknown primitive type');
      }
    }
    class NewClass extends PrimitiveType {}
    PRIMITIVE_TYPES.set(NewClass, value => {
      let errorMessage = baseValidator && baseValidator(value);
      if (!errorMessage) {
        errorMessage = validator(value);
      }
      return errorMessage;
    });
    return NewClass;
  }
}
