import type { RouteObject } from 'react-router-dom';

export const workbenchRoutes = [
  {
    path: '/all',
    lazy: () => import('./pages/workspace/all-page/all-page'),
  },
  {
    path: '/collection',
    lazy: () => import('./pages/workspace/all-collection'),
  },
  {
    path: '/collection/:collectionId',
    lazy: () => import('./pages/workspace/collection/index'),
  },
  {
    path: '/tag',
    lazy: () => import('./pages/workspace/all-tag'),
  },
  {
    path: '/tag/:tagId',
    lazy: () => import('./pages/workspace/tag'),
  },
  {
    path: '/notes',
    lazy: () => import('./pages/learnify/workspace/notes'),
  },
  {
    path: '/mind-maps',
    lazy: () => import('./pages/learnify/workspace/mind-maps'),
  },
  {
    path: '/quiz-cards',
    lazy: () => import('./pages/learnify/workspace/quiz-cards'),
  },
  {
    path: '/flashcards',
    lazy: () => import('./pages/learnify/workspace/flashcards'),
  },
  {
    path: '/podcasts',
    lazy: () => import('./pages/learnify/workspace/podcasts'),
  },
  {
    path: '/trash',
    lazy: () => import('./pages/workspace/trash-page'),
  },
  {
    path: '/:pageId',
    lazy: () => import('./pages/workspace/detail-page/detail-page'),
  },
  {
    path: '/:pageId/attachments/:attachmentId',
    lazy: () => import('./pages/workspace/attachment/index'),
  },
  {
    path: '/journals',
    lazy: () => import('./pages/journals'),
  },
  {
    path: '/settings',
    lazy: () => import('./pages/workspace/settings'),
  },
  {
    path: '*',
    lazy: () => import('./pages/404'),
  },
] satisfies RouteObject[];
