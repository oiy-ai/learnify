import type { Page } from '@playwright/test';

export function getDocIdFromUrl(url: string) {
  const pathname = new URL(url).pathname;

  const match = pathname.match(/\/workspace\/([^/]+)\/([^/]+)\/?/);
  if (match && match[2]) {
    return match[2];
  }
  throw new Error('Failed to get doc id from url');
}

export function getCurrentDocIdFromUrl(page: Page) {
  return getDocIdFromUrl(page.url());
}

export function getCurrentCollectionIdFromUrl(page: Page) {
  const pathname = new URL(page.url()).pathname;
  const match = pathname.match(/\/workspace\/([^/]+)\/collection\/([^/]+)\/?/);
  if (match && match[2]) {
    return match[2];
  }
  throw new Error('Failed to get collection id from url');
}
