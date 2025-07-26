/**
 * Predefined document IDs for Learnify system documents
 * These IDs are used to ensure consistent references across the application
 */

export const LEARNIFY_DOCUMENTS = {
  MATERIALS: 'learnify-list-of-materials',
} as const;

export type LearnifyDocumentId =
  (typeof LEARNIFY_DOCUMENTS)[keyof typeof LEARNIFY_DOCUMENTS];
