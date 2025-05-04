import { useCallback, useContext } from 'react';

import { MobileMenuContext } from './context';

export const useMobileMenuController = () => {
  const context = useContext(MobileMenuContext);

  /**
   * **A workaround to close mobile menu manually**
   * By default, it will close automatically when `MenuItem` clicked.
   * For custom menu content, you can use this method to close the menu.
   */
  const close = useCallback(() => {
    context.setOpen?.(false);
  }, [context]);

  return { close };
};
