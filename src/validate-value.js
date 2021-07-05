import PRIMITIVE_TYPES from './primitive-types.js';
import MODELS from './models-list.js';

const validateValue = (type, value, isOptional) => {
  // console.log('validate', propName, type, value);
  if (typeof value === 'undefined' || value === null) {
    if (!isOptional) {
      return `Required field is not defined`;
    }
  } else if (PRIMITIVE_TYPES.has(type)) {
    const errorMessage = PRIMITIVE_TYPES.get(type)(value);
    if (errorMessage) {
      return errorMessage;
    }
  } else if (MODELS.has(type)) {
    if (!(value instanceof type)) {
      return `Invalid value type`;
    }
  }
};

export default validateValue;
