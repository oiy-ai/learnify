import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
} from 'react';

import type { MenuSubProps } from '../menu.types';

export type SubMenuContent = {
  /**
   * Customize submenu's title
   * @default "Back"
   */
  title?: string;
  items: ReactNode;
  options?: MenuSubProps['subOptions'];
  contentOptions?: MenuSubProps['subContentOptions'];
  id: string;
};

export type MobileMenuContextValue = {
  subMenus: Array<SubMenuContent>;
  setSubMenus: Dispatch<SetStateAction<Array<SubMenuContent>>>;
  setOpen?: (v: boolean) => void;
};

export const MobileMenuContext = createContext<MobileMenuContextValue>({
  subMenus: [],
  setSubMenus: () => {},
});

export const useMobileSubMenuHelper = (
  contextValue?: MobileMenuContextValue
) => {
  const _context = useContext(MobileMenuContext);
  const { subMenus, setSubMenus } = contextValue ?? _context;

  const addSubMenu = useCallback(
    (subMenu: SubMenuContent) => {
      const id = subMenu.id;
      // if the submenu already exists, do nothing
      if (subMenus.some(sub => sub.id === id)) {
        return;
      }
      subMenu.options?.onOpenChange?.(true);
      setSubMenus(prev => {
        return [...prev, subMenu];
      });
    },
    [setSubMenus, subMenus]
  );

  const removeSubMenu = useCallback(
    (id: string) => {
      setSubMenus(prev => {
        const index = prev.findIndex(sub => sub.id === id);
        prev[index]?.options?.onOpenChange?.(false);
        return prev.filter(sub => sub.id !== id);
      });
    },
    [setSubMenus]
  );

  const removeAllSubMenus = useCallback(() => {
    setSubMenus([]);
  }, [setSubMenus]);

  return {
    addSubMenu,
    removeSubMenu,
    removeAllSubMenus,
  };
};
