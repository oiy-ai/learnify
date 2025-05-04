import { createIdentifier, type Memento } from '@toeverything/infra';

export interface WorkspaceLocalState extends Memento {}
export interface WorkspaceLocalCache extends Memento {}

export const WorkspaceLocalState = createIdentifier<WorkspaceLocalState>(
  'WorkspaceLocalState'
);

export const WorkspaceLocalCache = createIdentifier<WorkspaceLocalCache>(
  'WorkspaceLocalCache'
);
