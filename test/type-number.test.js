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
      }).toThrowError('Invalid data');
    });
    test('missing value', () => {
      expect(() => {
        new TestModel({
          number: null,
        });
      }).toThrowError('Invalid data');
      expect(() => {
        new TestModel({});
      }).toThrowError('Invalid data');
    });
  });

  test('incorrect optional value', () => {
    expect(() => {
      new TestModel({
        number: 234,
        optional: '234',
      });
    }).toThrowError('Invalid data');
  });
});
