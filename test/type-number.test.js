import Model from '../src/model.js';

describe('Number', () => {
  const TestModel = new Model({
    number: Number,
    'optional?': Number,
  });

  test('correct value', () => {
    const instance = new TestModel({
      number: 123.12,
    });
    expect(instance).toBeInstanceOf(TestModel);
    expect(instance).toBeInstanceOf(Model);
  });

  describe('incorrect value', () => {
    test('incorrect type', () => {
      expect(() => {
        new TestModel({
          number: '',
        });
      }).toThrowError('Data is invalid');
    });
    test('missing value', () => {
      expect(() => {
        new TestModel({
          number: null,
        });
      }).toThrowError('Data is invalid');
      expect(() => {
        new TestModel({});
      }).toThrowError('Data is invalid');
    });
  });

  test('incorrect optional value', () => {
    expect(() => {
      new TestModel({
        number: 234,
        optional: '234',
      });
    }).toThrowError('Data is invalid');
  });
});
