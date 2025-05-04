import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  '.',
  './packages/frontend/apps/electron',
  './blocksuite/**/*/vitest.config.ts',
]);
