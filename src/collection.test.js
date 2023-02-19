import Model from './model.js';
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
  });
});
