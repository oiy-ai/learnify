export type SpaceType = 'workspace' | 'userspace';

export function universalId({
  peer,
  type,
  id,
}: {
  peer: string;
  type: SpaceType;
  id: string;
}) {
  return `@peer(${peer});@type(${type});@id(${id});`;
}

export function isValidSpaceType(type: string): type is SpaceType {
  return type === 'workspace' || type === 'userspace';
}

export function isValidUniversalId(opts: Record<string, string>): boolean {
  const requiredKeys = ['peer', 'type', 'id'] as const;

  for (const key of requiredKeys) {
    if (!opts[key]) {
      return false;
    }
  }

  return isValidSpaceType(opts.type);
}

export function parseUniversalId(id: string): {
  peer: string;
  type: SpaceType;
  id: string;
} {
  const result: Partial<{
    peer: string;
    type: SpaceType;
    id: string;
  }> = {};
  let key = '';
  let value = '';
  let isInValue = false;

  let i = -1;

  while (++i < id.length) {
    const ch = id[i];
    const nextCh = id[i + 1];

    // when we are in value string, we only care about ch and next char to be [')', ';'] to end the id part
    if (isInValue) {
      if (ch === ')' && nextCh === ';') {
        // @ts-expect-error we know the key is valid
        result[key] = value;
        key = '';
        value = '';
        isInValue = false;
        i++;
        continue;
      }

      value += ch;
      continue;
    }

    if (ch === '@') {
      const keyEnd = id.indexOf('(', i);
      // we find '@' but no '(' in lookahead or '(' is immediately after '@', invalid id
      if (keyEnd === -1 || keyEnd === i + 1) {
        break;
      }

      key = id.slice(i + 1, keyEnd);
      i = keyEnd;
      isInValue = true;
    } else {
      break;
    }
  }

  if (!isValidUniversalId(result)) {
    throw new Error(
      `Invalid universal storage id: ${id}. It should be in format of @peer(\${peer});@type(\${type});@id(\${id});`
    );
  }

  return result as {
    peer: string;
    type: SpaceType;
    id: string;
  };
}
