import { LiveData } from '@toeverything/infra';

export const enableNavigationGesture$ = new LiveData(false);

const onTouchStart = (e: TouchEvent) => {
  if (enableNavigationGesture$.value) return;

  const clientX = e.changedTouches[0].clientX;
  if (clientX <= 25) {
    e.preventDefault();
  }
};
document.body.addEventListener('touchstart', onTouchStart, { passive: false });
