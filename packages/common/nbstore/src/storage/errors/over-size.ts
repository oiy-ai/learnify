export class OverSizeError extends Error {
  constructor(public originError?: any) {
    super('Blob size exceeds the limit.');
  }
}
