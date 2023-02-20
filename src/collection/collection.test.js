import Model from '../model/model.js';
import Collection from './collection.js';

describe('Model', () => {
  describe('#constructor', () => {
    test('conversion to string', () => {
      expect(`${Collection}`).toEqual('[class Collection]');
      expect(`${new Collection()}`).toEqual('[object Collection]');
    });

    test('inheritance', () => {
      const DerivedCollection = new Collection(String);
      const instance = new DerivedCollection([]);
      expect(instance instanceof DerivedCollection).toBe(true);
      expect(instance instanceof Collection).toBe(true);
      expect([] instanceof Collection).toBe(false);
      expect(null instanceof Collection).toBe(false);
      expect(instance instanceof Model).toBe(true);
      expect(Model.isModel(DerivedCollection)).toBe(true);
      expect(`${DerivedCollection}`).toEqual('[class Collection]');
      expect(`${instance}`).toEqual('[object Collection]');
    });

    test('invalid input', () => {
      const DerivedCollection = new Collection(String);
      expect(() => {
        new DerivedCollection(() => {});
      }).toThrowError('Data is not valid: "<collection_data>" must be an array');
      expect(() => {
        new DerivedCollection([123]);
      }).toThrowError('Data is not valid: "[0]" must be a string');
    });

    describe('freeze', () => {
      const MyCollection = new Collection({
        name: String,
        value: Number,
        object: {
          prop3: Boolean,
        },
      });
      const myData = new MyCollection([
        {
          name: 'abc',
          value: 123,
          object: {
            prop3: true,
          },
        },
        {
          name: 'def',
          value: 456,
          object: {
            prop3: false,
          },
        },
      ]);
      test('model access', () => {
        expect(myData.constructor).toBe(MyCollection);
        expect(myData.toString()).toBe('[object Collection]');
      });
      test('property access', () => {
        expect(myData[0].name).toEqual('abc');
        expect(0 in myData).toBe(true);
        expect(2 in myData).toBe(false);
        expect(myData[0].value).toEqual(123);
        expect(myData[0].object.prop3).toBe(true);
        expect(myData[3]).toBeUndefined();
        expect(myData[1].object).toEqual(expect.any(Model));
        expect('prop3' in myData[1].object).toBe(true);
        expect(myData[1].object.prop3).toBe(false);
        expect(myData.length).toEqual(2);
      });
      test('properties iteration', () => {
        expect(Object.keys(myData)).toEqual(['0', '1']);
        expect(Object.keys(myData[1].object)).toEqual(['prop3']);
        expect(Object.entries(myData[1].object)).toEqual([['prop3', false]]);
      });
      test('property assignment', () => {
        expect.assertions(6);
        try {
          myData.prop1 = '1234';
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'set' on proxy: trap returned falsish for property 'prop1'");
        }
        try {
          myData[1].object.prop3 = false;
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'set' on proxy: trap returned falsish for property 'prop3'");
        }
        try {
          myData[1] = false;
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'set' on proxy: trap returned falsish for property '1'");
        }
      });
      test('property deletion', () => {
        expect.assertions(6);
        try {
          delete myData[0];
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'deleteProperty' on proxy: trap returned falsish for property '0'");
        }
        expect(myData[0].name).toEqual('abc');
        try {
          delete myData[0].object.prop3;
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'deleteProperty' on proxy: trap returned falsish for property 'prop3'");
        }
        expect(myData[0].object.prop3).toEqual(true);
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
          Object.defineProperty(myData[1], 'property2', {
            value: 42,
            writable: false,
          });
        } catch (e) {
          expect(e.name).toEqual('TypeError');
          expect(e.message).toContain("'defineProperty' on proxy: trap returned falsish for property 'property2'");
        }
        expect(myData[1]).not.toHaveProperty('property2');
      });
    });

    describe('create from shortcut', () => {
      const Item = new Model({
        name: String,
      });
      describe('should check for collection size and content type', () => {
        test('any size', () => {
          expect.assertions(4);
          const TestModel = new Model({
            items: [Item],
          });
          expect(() => {
            new TestModel({
              items: [],
            });
          }).not.toThrow();
          expect(() => {
            new TestModel({
              items: [{ name: 'item1' }, new Item({ name: 'item1' })],
            });
          }).not.toThrow();
          try {
            new TestModel({
              items: [{ name: 'item1' }, new Item({ name: 'item1' }), {}],
            });
          } catch (error) {
            expect(error.message).toEqual('Data is not valid: "items.[2].name" required property is not defined');
            expect(error.cause).toEqual(['"items.[2].name" required property is not defined']);
          }
        });
        test('exact size', () => {
          expect.assertions(2);
          const TestModel = new Model({
            items: [Item, Item, Item],
          });
          try {
            new TestModel({
              items: [{ name: 'item1' }, {}],
            });
          } catch (error) {
            expect(error.message).toEqual('Data is not valid: see "error.cause" for details');
            expect(error.cause).toEqual([
              '"items.[1].name" required property is not defined',
              '"items.size" must be 3',
            ]);
          }
        });
        test('max size', () => {
          expect.assertions(2);
          const TestModel = new Model({
            // eslint-disable-next-line no-sparse-arrays
            items: [Item, ,],
          });
          try {
            new TestModel({
              items: [{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }],
            });
          } catch (error) {
            expect(error.message).toEqual('Data is not valid: "items.size" must be less then or equal to 2');
            expect(error.cause).toEqual(['"items.size" must be less then or equal to 2']);
          }
        });
        test('min size', () => {
          expect.assertions(2);
          const TestModel = new Model({
            // eslint-disable-next-line no-sparse-arrays
            items: [Item, { min: 5 }],
          });
          try {
            new TestModel({
              items: [{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }],
            });
          } catch (error) {
            expect(error.message).toEqual('Data is not valid: "items.size" must be equal to or more then 5');
            expect(error.cause).toEqual(['"items.size" must be equal to or more then 5']);
          }
        });
        test('range', () => {
          expect.assertions(2);
          const TestModel = new Model({
            // eslint-disable-next-line no-sparse-arrays
            items: [Item, { min: 1, max: 2 }],
          });
          try {
            new TestModel({
              items: [{ name: 'item1' }, { name: 'item2' }, { name: 'item3' }],
            });
          } catch (error) {
            expect(error.message).toEqual('Data is not valid: "items.size" must be less then or equal to 2');
            expect(error.cause).toEqual(['"items.size" must be less then or equal to 2']);
          }
        });
      });
    });

    describe('data access', () => {
      test('simple collection', () => {
        const StringCollection = new Collection(String);
        const instance = new StringCollection(['a', 'b', 'c']);
        expect(instance[2]).toEqual('c');
      });
      test('complicated collection', () => {
        const ComplexCollection = new Model({
          items: [
            {
              title: String,
              fields: [
                {
                  name: String,
                  value: String,
                },
              ],
            },
          ],
        });
        const instance = new ComplexCollection({
          items: [
            {
              title: 'item1',
              fields: [
                {
                  name: 'email',
                  value: '@gmail.com',
                },
              ],
            },
            {
              title: 'item2',
              fields: [
                {
                  name: 'firstName',
                  value: 'Paul',
                },
                {
                  name: 'address',
                  value: '1234',
                },
              ],
            },
          ],
        });
        expect(instance.items[0].fields[0].value).toEqual('@gmail.com');
        expect(instance.items[1].fields[1].value).toEqual('1234');
      });
    });
  });

  describe('.validate', () => {
    test('valid input', () => {
      const DerivedCollection = new Collection(String);
      expect(DerivedCollection.validate(['123', '456'])).toBeUndefined();
      expect(DerivedCollection.validate(new DerivedCollection(['a', 'b', 'c']))).toBeUndefined();
    });
    test('invalid input', () => {
      const DerivedCollection = new Collection(String);
      expect(DerivedCollection.validate(() => {})).toEqual(['invalid collection type']);
      expect(DerivedCollection.validate(new Collection(Number))).toEqual(['invalid collection type']);
    });
  });
});
