/**
 * Tell a binary is empty yjs binary or not.
 *
 * NOTE:
 *   `[0, 0]` is empty yjs update binary
 *   `[0]` is empty yjs state vector binary
 */
export function isEmptyUpdate(binary: Uint8Array) {
  return (
    binary.byteLength === 0 ||
    (binary.byteLength === 2 && binary[0] === 0 && binary[1] === 0)
  );
}
