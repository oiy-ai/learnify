import { expect } from 'vitest';
import { applyUpdate, Doc as YDoc } from 'yjs';

export function expectYjsEqual(
  doc: Uint8Array | YDoc,
  match: Record<string, any>
) {
  let ydoc: YDoc;
  if (doc instanceof Uint8Array) {
    ydoc = new YDoc();
    applyUpdate(ydoc, doc);
  } else {
    ydoc = doc;
  }

  for (const key in match) {
    const value = match[key];
    if (Array.isArray(value)) {
      const actual = ydoc.getArray(key).toJSON();
      expect(actual).toEqual(value);
    } else if (typeof value === 'string') {
      const actual = ydoc.getText(key).toJSON();
      expect(actual).toEqual(value);
    } else {
      const actual = ydoc.getMap(key).toJSON();
      expect(actual).toEqual(value);
    }
  }
  return doc;
}
