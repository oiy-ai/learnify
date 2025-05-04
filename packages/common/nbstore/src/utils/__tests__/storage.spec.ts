import { describe, expect, it } from 'vitest';

import { parseUniversalId, universalId } from '../universal-id';

describe('parseUniversalId', () => {
  it('should generate universal id', () => {
    expect(universalId({ peer: '123', type: 'workspace', id: '456' })).toEqual(
      '@peer(123);@type(workspace);@id(456);'
    );
  });

  it('should parse universal id', () => {
    const testcases = [
      '@peer(123);@type(userspace);@id(456);',
      '@peer(123);@type(workspace);@id(456);',
      '@peer(https://app.affine.pro);@type(userspace);@id(hello:world);',
      '@peer(@name);@type(userspace);@id(@id);',
      '@peer(@peer(name);@type(userspace);@id(@id);',
    ];

    testcases.forEach(id => {
      expect(parseUniversalId(id)).toMatchSnapshot(id);
    });
  });

  it('should throw invalid universal id', () => {
    const testcases = [
      '@peer(123);@type(anyspace);@id(456);', // invalid space type
      '@peer(@peer(name););@type(userspace);@id(@id);', // invalid peer
    ];

    testcases.forEach(id => {
      expect(() => parseUniversalId(id)).toThrow();
    });
  });
});
