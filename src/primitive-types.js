const DATA_TYPES = new WeakMap();
DATA_TYPES.set(String, value => (typeof value === 'string' ? undefined : 'must be a string'));
DATA_TYPES.set(Number, value => (typeof value === 'number' ? undefined : 'must be a number'));
DATA_TYPES.set(Boolean, value => (typeof value === 'boolean' ? undefined : 'must be a boolean'));
DATA_TYPES.set(Date, value => (value instanceof Date ? undefined : 'must be a date'));

export default DATA_TYPES;
