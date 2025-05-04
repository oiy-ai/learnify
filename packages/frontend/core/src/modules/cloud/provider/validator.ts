import { createIdentifier } from '@toeverything/infra';

export interface ValidatorProvider {
  /**
   * Calculate a token based on the server's challenge and resource to pass the
   * challenge validation.
   */
  validate: (challenge: string, resource: string) => Promise<string>;
}

export const ValidatorProvider =
  createIdentifier<ValidatorProvider>('ValidatorProvider');
