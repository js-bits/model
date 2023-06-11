import enumerate from '@js-bits/enumerate';
import DataType from '../../data-type/data-type.js';
import Model from '../model.js';

describe('Enum', () => {
  const Unit = enumerate.ts('FOOT, METER');

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

  test('new DataType', () => {
    const Enum = enumerate.ts('ONE TWO THREE', String);

    const ONE = new DataType({
      extends: Enum,
      validate(value) {
        return value === 'ONE' ? undefined : 'must be equal to "ONE"';
      },
    });

    expect(DataType.validate(ONE, 'ONE')).toBeUndefined();
    expect(DataType.validate(Enum, 'ONE')).toBeUndefined();
    expect(DataType.validate(Enum, 'THREE')).toBeUndefined();
    expect(DataType.validate(ONE, 'TWO')).toEqual(['must be equal to "ONE"']);
  });

  describe('incorrect value', () => {
    test('incorrect type', () => {
      expect.assertions(3);
      try {
        new TestModel({
          unit: 123,
        });
      } catch (error) {
        expect(error.name).toEqual('DataType|ValidationError');
        expect(error.message).toEqual(
          'Data is not valid: "unit" must be one of allowed values [Symbol(FOOT),Symbol(METER)]'
        );
        expect(error.cause).toEqual(['"unit" must be one of allowed values [Symbol(FOOT),Symbol(METER)]']);
      }
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
