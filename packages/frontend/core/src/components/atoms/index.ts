import { atom } from 'jotai';

/**
 * @deprecated use `useSignOut` hook instated
 */
export const openQuotaModalAtom = atom(false);

export type AllPageFilterOption =
  | 'docs'
  | 'collections'
  | 'tags'
  | 'notes'
  | 'mind-map'
  | 'quiz-cards'
  | 'flashcards'
  | 'podcasts';
export const allPageFilterSelectAtom = atom<AllPageFilterOption>('docs');
