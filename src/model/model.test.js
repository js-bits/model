import DataType from '../data-type/data-type.js';
import Model from './model.js';
import Schema from './schema.js';

describe('Model', () => {
  describe('#constructor', () => {
    test('conversion to string', () => {
      expect(`${Model}`).toEqual('[class Model]');
      expect(`${new Model()}`).toEqual('[object Model]');
    });

    test('inheritance', () => {
      const DerivedModel = new Model({
        'test?': String,
      });
      const instance = new DerivedModel({});
      expect(instance instanceof DerivedModel).toBe(true);
      expect(instance instanceof Model).toBe(true);
      expect(`${DerivedModel}`).toEqual('[class Model]');
      expect(`${instance}`).toEqual('[object Model]');
    });

    describe('freeze', () => {
      const MyModel = new Model({
        prop1: String,
        prop2: Number,
        object: {
          prop3: Boolean,
        },
      });
      const myData = new MyModel({
        prop1: 'abc',
        prop2: 123,
        object: {
          prop3: true,
        },
      });
      test('model access', () => {
        expect(myData.constructor).toBe(MyModel);
        expect(myData.toString()).toBe('[object Model]');
      });
      test('property access', () => {
        expect(myData.prop1).toEqual('abc');
        expect('prop1' in myData).toBe(true);
        expect(myData.prop2).toEqual(123);
        expect(myData.prop3).toBeUndefined();
        expect('prop3' in myData).toBe(false);
        expect(myData.object).toEqual(expect.any(Model));
        expect(myData.object.prop3).toBe(true);
        expect('prop3' in myData.object).toBe(true);
      });
      test('properties iteration', () => {
        expect(Object.keys(myData)).toEqual(['prop1', 'prop2', 'object']);
        expect(Object.keys(myData.object)).toEqual(['prop3']);
        expect(Object.entries(myData.object)).toEqual([['prop3', true]]);
      });
      test('property assignment', () => {
        expect.assertions(4);
        try {
          myData.prop1 = '1234';
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'set' on proxy: trap returned falsish for property 'prop1'");
        }
        try {
          myData.object.prop3 = false;
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'set' on proxy: trap returned falsish for property 'prop3'");
        }
      });
      test('property deletion', () => {
        expect.assertions(6);
        try {
          delete myData.prop1;
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'deleteProperty' on proxy: trap returned falsish for property 'prop1'");
        }
        expect(myData.prop1).toEqual('abc');
        try {
          delete myData.object.prop3;
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'deleteProperty' on proxy: trap returned falsish for property 'prop3'");
        }
        expect(myData.object.prop3).toEqual(true);
      });
      test('property definition', () => {
        expect.assertions(6);
        try {
          Object.defineProperty(myData, 'property1', {
            value: 42,
            writable: false,
          });
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'defineProperty' on proxy: trap returned falsish for property 'property1'");
        }
        expect(myData).not.toHaveProperty('property1');
        try {
          Object.defineProperty(myData.object, 'property2', {
            value: 42,
            writable: false,
          });
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'defineProperty' on proxy: trap returned falsish for property 'property2'");
        }
        expect(myData.object).not.toHaveProperty('property2');
      });
    });

    describe('invalid schema', () => {
      test('empty schema', () => {
        expect.assertions(3);
        try {
          new Model({});
        } catch (error) {
          expect(error.message).toEqual('Model schema is empty');
          expect(error.name).toEqual(Schema.InvalidModelSchemaError);
          expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        }
      });
      test('wrong object type', () => {
        expect.assertions(3);
        try {
          new Model(new Date());
        } catch (error) {
          expect(error.message).toEqual('Model schema is invalid');
          expect(error.name).toEqual(Schema.InvalidModelSchemaError);
          expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        }
      });
      test('wrong schema parameter', () => {
        expect.assertions(3);
        try {
          new Model({
            func: () => {},
          });
        } catch (error) {
          expect(error.message).toEqual('Model schema is invalid: data type of "func" property is invalid');
          expect(error.name).toEqual(Schema.InvalidModelSchemaError);
          expect(error.name).toEqual('Schema|InvalidModelSchemaError');
        }
      });
    });

    describe('data type', () => {
      const MyModel = new Model({
        string: String,
      });
      test('valid data type', () => {
        const instance = new MyModel({ string: '' });
        expect(DataType.is(Model, instance)).toBe(true);
        expect(DataType.validate(Model, MyModel)).toEqual(['must be a model']);
      });

      test('invalid data type', () => {
        expect.assertions(3);
        try {
          new MyModel(MyModel);
        } catch (error) {
          expect(error.message).toEqual('Data is not valid: "<model_data>" must be a plain object');
          expect(error.name).toEqual(DataType.ValidationError);
          expect(error.name).toEqual('DataType|ValidationError');
        }
      });
    });

    describe('built-in types', () => {
      describe('multiple fields', () => {
        const DerivedModel = new Model({
          string: String,
          number: Number,
          boolean: Boolean,
          date: Date,
          'optional?': String,
        });

        test('correct values', () => {
          const instance = new DerivedModel({
            string: '',
            number: 0,
            date: new Date(),
            boolean: false,
          });
          expect(instance).toBeInstanceOf(DerivedModel);
          expect(instance).toBeInstanceOf(Model);
        });

        test('incorrect values', () => {
          expect(() => {
            new DerivedModel({
              string: 123,
              number: '',
              date: false,
              boolean: new Date(),
              optional: 234,
            });
          }).toThrowError('Data is not valid');
        });
      });
    });
  });

  describe('specifiers', () => {
    test('! specifier', () => {
      const MyModel = new Model({
        string: String,
        date: Date,
        'required!': Boolean,
        'number!': Number,
      });
      expect(MyModel.validate({})).toEqual([
        '"required" required property is not defined',
        '"number" required property is not defined',
      ]);
    });
    test('? specifier', () => {
      const MyModel = new Model({
        string: String,
        date: Date,
        'optional?': Boolean,
        'number?': Number,
      });
      expect(MyModel.validate({})).toEqual([
        '"string" required property is not defined',
        '"date" required property is not defined',
      ]);
    });
    test('illegal usage of both ! and ?', () => {
      expect(() => {
        const MyModel = new Model({
          string: String,
          date: Date,
          'optional?': Boolean,
          'required!': true,
        });
      }).toThrow('Model schema is invalid. Must contain either ? or ! specifiers');
    });
  });

  describe('.validate', () => {
    const DerivedModel = new Model({
      string: String,
      number: Number,
      boolean: Boolean,
      date: Date,
      'optional?': String,
    });

    test('incorrect data', () => {
      expect(DerivedModel.validate('')).toEqual(['invalid model type']);
    });

    test('incorrect values', () => {
      expect(
        DerivedModel.validate({
          string: 123,
          number: '',
          date: false,
          boolean: new Date(),
          optional: 234,
        })
      ).toEqual([
        '"string" must be a string',
        '"number" must be a number',
        '"boolean" must be a boolean',
        '"date" must be a date',
        '"optional" must be a string',
      ]);
    });
  });

  describe('.isModel', () => {
    const MyModel = new Model({
      string: String,
    });

    test('should return true for models', () => {
      expect(Model.isModel(MyModel)).toBe(true);
    });

    test('should return false otherwise', () => {
      expect(Model.isModel(Model)).toBe(false);
      expect(Model.isModel(Function)).toBe(false);
      expect(Model.isModel()).toBe(false);
    });
  });

  describe('Model.SAME', () => {
    test('should return true for models', () => {
      expect(DataType.validate(Model.SAME, '')).toEqual(['Model.SAME must not be use directly']);
    });
    test('multiple Model.SAME on a single model is applied to a closest model, not to the root model', () => {
      const Node = new Model({
        name: String,
        'parent?': Model.SAME,
        object: {
          prop: Number,
          'object?': Model.SAME,
        },
      });
      const Tree = new Model({
        title: String,
        'subTree?': Model.SAME,
        node: Node,
      });
      expect(() => {
        new Tree({
          title: 'tree',
          subTree: {
            title: 'sub-tree',
            node: {
              name: 'node',
              object: {
                prop: 555,
              },
            },
          },
          node: {
            name: 'node',
            parent: {
              name: 'parent-node',
              object: {
                prop: 123,
                object: {
                  prop: 456,
                },
              },
            },
            object: {
              prop: 678,
              object: {
                prop: 901,
              },
            },
          },
        });
      }).not.toThrow();
    });
  });
});
