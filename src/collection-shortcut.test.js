/* eslint-disable no-sparse-arrays */
import shortcut from './collection-shortcut.js';

describe('shortcutArray', () => {
  test('array with a single item', () => {
    expect(shortcut([Number])).toEqual({ type: Number });

    expect(shortcut([])).toEqual({ type: undefined });
    expect(shortcut([null])).toEqual({ type: null });
  });

  describe('array with multiple items', () => {
    test('array with a single item and a config', () => {
      expect(shortcut([Number, { min: 10 }])).toEqual({ type: Number, min: 10 });
      expect(shortcut([String, { max: 10 }])).toEqual({ type: String, max: 10 });
      expect(shortcut([Number, { min: 1, max: 5 }])).toEqual({ type: Number, min: 1, max: 5 });
      expect(shortcut([Number, {}])).toEqual({ type: Number });
    });

    test('array with an invalid config', () => {
      expect(shortcut([,])).toEqual({ type: undefined });
      expect(() => {
        shortcut([Number, Object]);
      }).toThrow('Invalid collection shortcut');
      expect(() => {
        shortcut([Number, 123]);
      }).toThrow('Invalid collection shortcut');
      expect(() => {
        shortcut([, , Number, , 123]);
      }).toThrow('Invalid collection shortcut');
      expect(() => {
        shortcut([, Number]);
      }).toThrow('Invalid collection shortcut');
      expect(() => {
        shortcut([, , , Number]);
      }).toThrow('Invalid collection shortcut');
      expect(() => {
        shortcut([Number, , , Number]);
      }).toThrow('Invalid collection shortcut');
    });

    test('array without a config', () => {
      expect(shortcut([Number, ,])).toEqual({ type: Number, max: 2 });
      expect(shortcut([Number, , , , ,])).toEqual({ type: Number, max: 5 });
      expect(shortcut([Number, Number, Number, Number])).toEqual({ type: Number, min: 4, max: 4 });
    });
  });
});
