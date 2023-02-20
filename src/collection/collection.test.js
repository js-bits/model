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
      expect(instance instanceof Model).toBe(true);
      expect(`${DerivedCollection}`).toEqual('[class Collection]');
      expect(`${instance}`).toEqual('[object Collection]');
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
        expect.assertions(4);
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
  });
});
