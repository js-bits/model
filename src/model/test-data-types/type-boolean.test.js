import Model from '../model.js';

describe('Boolean', () => {
  const TestModel = new Model({
    boolean: Boolean,
    'optional?': Boolean,
  });

  test('correct value', () => {
    const instance1 = new TestModel({
      boolean: false,
    });
    const instance2 = new TestModel({
      boolean: true,
      optional: null,
    });
    const instance3 = new TestModel({
      boolean: false,
      optional: false,
    });
    expect(instance1).toBeInstanceOf(TestModel);
    expect(instance1).toBeInstanceOf(Model);
    expect(instance1.boolean).toBe(false);
    expect(instance1.optional).toBeNull();
    expect(instance2.boolean).toBe(true);
    expect(instance2.optional).toBeNull();
    expect(instance3.boolean).toBe(false);
    expect(instance3.optional).toBe(false);
  });

  describe('incorrect value', () => {
    test('incorrect type', () => {
      expect(() => {
        new TestModel({
          boolean: 123,
        });
      }).toThrowError('Data is not valid');
    });
    test('missing value', () => {
      expect(() => {
        new TestModel({
          boolean: null,
        });
      }).toThrowError('Data is not valid');
      expect(() => {
        new TestModel({});
      }).toThrowError('Data is not valid');
    });
  });

  test('incorrect optional value', () => {
    expect(() => {
      new TestModel({
        boolean: false,
        optional: 123,
      });
    }).toThrowError('Data is not valid');
  });
});
