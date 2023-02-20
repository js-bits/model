import enumerate from '@js-bits/enumerate';
import Model from '../src/model/model.js';

describe('Enum', () => {
  const Unit = enumerate`FOOT, METER`;

  const TestModel = new Model({
    unit: Unit,
    'optional?': Unit,
  });

  test('correct value', () => {
    const instance = new TestModel({
      unit: Unit.FOOT,
    });
    expect(instance).toBeInstanceOf(TestModel);
    expect(instance).toBeInstanceOf(Model);
  });

  describe('incorrect value', () => {
    test('incorrect type', () => {
      let error;
      try {
        new TestModel({
          unit: 123,
        });
      } catch (e) {
        error = e;
      }
      expect(error).toEqual(new Error('Data is not valid'));
      expect(error.cause).toEqual(['"unit": must be one of allowed values [Symbol(FOOT),Symbol(METER)]']);
    });
    test('missing value', () => {
      expect(() => {
        new TestModel({
          unit: Symbol('METER'),
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
        unit: Unit.METER,
        optional: 123,
      });
    }).toThrowError('Data is not valid');
  });
});
