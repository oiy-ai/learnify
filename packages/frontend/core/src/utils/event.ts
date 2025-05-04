import type { BaseSyntheticEvent } from 'react';

export function stopPropagation(event: BaseSyntheticEvent) {
  event.stopPropagation();
}

export function preventDefault(event: BaseSyntheticEvent) {
  event.preventDefault();
}

export function isNewTabTrigger(event?: React.MouseEvent | MouseEvent) {
  return event
    ? (event.ctrlKey || event.metaKey || event.button === 1) && !event.altKey
    : false;
}

export function isNewViewTrigger(event?: React.MouseEvent | MouseEvent) {
  return event ? (event.ctrlKey || event.metaKey) && event.altKey : false;
}

export function inferOpenMode(event?: React.MouseEvent | MouseEvent) {
  if (isNewTabTrigger(event)) {
    return 'new-tab';
  } else if (isNewViewTrigger(event)) {
    return BUILD_CONFIG.isElectron ? 'tail' : 'new-tab';
  }
  return 'active';
}
