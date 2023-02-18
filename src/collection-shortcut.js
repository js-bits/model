import DataType from './data-type.js';

export default array => {
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
