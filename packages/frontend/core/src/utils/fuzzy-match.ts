/**
 * Checks if the name is a fuzzy match of the query.
 *
 * @example
 * ```ts
 * const name = 'John Smith';
 * const query = 'js';
 * const isMatch = fuzzyMatch(name, query);
 * // isMatch: true
 * ```
 *
 * if initialMatch = true, the first char must match as well
 */
export function fuzzyMatch(
  name: string,
  query: string,
  matchInitial?: boolean
) {
  const pureName = [...name.trim().toLowerCase()]
    .filter(char => char !== ' ')
    .join('');

  const regex = new RegExp(
    [...query]
      .filter(char => char !== ' ')
      .map(item => `${escapeRegExp(item)}.*`)
      .join(''),
    'i'
  );

  if (matchInitial && query.length > 0 && !pureName.startsWith(query[0])) {
    return false;
  }

  return regex.test(pureName);
}

function escapeRegExp(input: string) {
  // escape regex characters in the input string to prevent regex format errors
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
