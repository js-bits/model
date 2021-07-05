const PRIMITIVE_TYPES = new WeakMap();
PRIMITIVE_TYPES.set(String, value => (typeof value === 'string' ? undefined : 'must be a string'));
PRIMITIVE_TYPES.set(Number, value => (typeof value === 'number' ? undefined : 'must be a number'));
PRIMITIVE_TYPES.set(Boolean, value => (typeof value === 'boolean' ? undefined : 'must be a boolean'));
PRIMITIVE_TYPES.set(Date, value => (value instanceof Date ? undefined : 'must be a date'));

export default PRIMITIVE_TYPES;
