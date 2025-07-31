/**
 * Predefined collection IDs for Learnify system collections
 * These IDs are used to ensure consistent references across the application
 */

export const LEARNIFY_COLLECTIONS = {
  MIND_MAPS: 'learnify-mind-maps-collection',
  PODCASTS: 'learnify-podcasts-collection',
  FLASHCARDS: 'learnify-flashcards-collection',
  NOTES: 'learnify-notes-collection',
} as const;

export type LearnifyCollectionId =
  (typeof LEARNIFY_COLLECTIONS)[keyof typeof LEARNIFY_COLLECTIONS];
