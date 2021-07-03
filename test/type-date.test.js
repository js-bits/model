import Model from '../src/model.js';

describe('Date', () => {
  const TestModel = new Model({
    date: Date,
    'optional?': Date,
  });

  test('correct value', () => {
    const instance = new TestModel({
      date: new Date(),
    });
    expect(instance).toBeInstanceOf(TestModel);
    expect(instance).toBeInstanceOf(Model);
  });

  describe('incorrect value', () => {
    test('incorrect type', () => {
      expect(() => {
        new TestModel({
          date: new Model(),
          optional: new Date(),
        });
      }).toThrowError('Invalid data');
    });
    test('missing value', () => {
      expect(() => {
        new TestModel({
          date: null,
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
        date: new Date(),
        optional: 123,
      });
    }).toThrowError('Invalid data');
  });
});
