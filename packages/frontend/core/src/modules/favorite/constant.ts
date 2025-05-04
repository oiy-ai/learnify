export const FavoriteSupportType = [
  'collection',
  'doc',
  'tag',
  'folder',
] as const;
export type FavoriteSupportTypeUnion = 'collection' | 'doc' | 'tag' | 'folder';
export const isFavoriteSupportType = (
  type: string
): type is FavoriteSupportTypeUnion =>
  FavoriteSupportType.includes(type as FavoriteSupportTypeUnion);
