import {
  IconButton,
  type IconButtonProps,
  useIsInsideModal,
} from '@affine/component';
import { ArrowLeftSmallIcon, CloseIcon } from '@blocksuite/icons/rc';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useMemo } from 'react';

import { NavigationGestureService } from '../../modules/navigation-gesture';

export interface NavigationBackButtonProps extends IconButtonProps {
  backAction?: () => void;
}

/**
 * A button to control the back behavior of the mobile app, as well as manage navigation gesture
 */
export const NavigationBackButton = ({
  icon,
  backAction,
  children,
  style: propsStyle,
  ...otherProps
}: NavigationBackButtonProps) => {
  const navigationGesture = useService(NavigationGestureService);
  const isInsideModal = useIsInsideModal();

  const handleRouteBack = useCallback(() => {
    backAction ? backAction() : history.back();
  }, [backAction]);

  useEffect(() => {
    if (isInsideModal) return;

    const prev = navigationGesture.enabled$.value;
    navigationGesture.setEnabled(true);

    return () => {
      navigationGesture.setEnabled(prev);
    };
  }, [isInsideModal, navigationGesture]);

  const style = useMemo(() => ({ padding: 10, ...propsStyle }), [propsStyle]);

  if (children) return children;

  return (
    <IconButton
      size={24}
      style={style}
      onClick={handleRouteBack}
      icon={icon ?? (isInsideModal ? <CloseIcon /> : <ArrowLeftSmallIcon />)}
      data-testid="page-header-back"
      {...otherProps}
    />
  );
};
