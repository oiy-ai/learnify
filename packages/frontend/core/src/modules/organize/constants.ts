export const OrganizeSupportType = [
  'folder',
  'doc',
  'collection',
  'tag',
] as const;
export type OrganizeSupportTypeUnion = 'folder' | 'doc' | 'collection' | 'tag';

export const isOrganizeSupportType = (
  type: string
): type is OrganizeSupportTypeUnion =>
  OrganizeSupportType.includes(type as OrganizeSupportTypeUnion);
