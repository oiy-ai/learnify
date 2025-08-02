import * as TabsGroup from '@radix-ui/react-tabs';
import clsx from 'clsx';
import { createContext, forwardRef, type RefAttributes, useContext, useState, useCallback } from 'react';

import * as styles from './tabs.css';

interface TabsContextValue {
  triggerMode?: 'click' | 'hover';
  onTabHover?: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue>({});

interface TabsRootProps extends TabsGroup.TabsProps, RefAttributes<HTMLDivElement> {
  triggerMode?: 'click' | 'hover';
}

export const TabsRoot = forwardRef<
  HTMLDivElement,
  TabsRootProps
>(({ children, className, triggerMode = 'click', value, onValueChange, ...props }, ref) => {
  const [hoverValue, setHoverValue] = useState<string | undefined>();
  
  const handleValueChange = useCallback((newValue: string) => {
    if (triggerMode === 'hover') {
      setHoverValue(newValue);
    }
    onValueChange?.(newValue);
  }, [triggerMode, onValueChange]);

  const contextValue = {
    triggerMode,
    onTabHover: triggerMode === 'hover' ? handleValueChange : undefined,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <TabsGroup.Root
        {...props}
        ref={ref}
        value={triggerMode === 'hover' && hoverValue ? hoverValue : value}
        onValueChange={handleValueChange}
        className={clsx(className, styles.tabsRoot)}
      >
        {children}
      </TabsGroup.Root>
    </TabsContext.Provider>
  );
});

TabsRoot.displayName = 'TabsRoot';

export const TabsList = forwardRef<
  HTMLDivElement,
  TabsGroup.TabsListProps & RefAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <TabsGroup.List
      {...props}
      ref={ref}
      className={clsx(className, styles.tabsList)}
    >
      {children}
    </TabsGroup.List>
  );
});

TabsList.displayName = 'TabsList';

export const TabsTrigger = forwardRef<
  HTMLButtonElement,
  TabsGroup.TabsTriggerProps & RefAttributes<HTMLButtonElement>
>(({ children, className, value, ...props }, ref) => {
  const { triggerMode, onTabHover } = useContext(TabsContext);
  
  const handleMouseEnter = useCallback(() => {
    if (triggerMode === 'hover' && onTabHover && value) {
      onTabHover(value);
    }
  }, [triggerMode, onTabHover, value]);

  return (
    <TabsGroup.Trigger
      {...props}
      ref={ref}
      value={value}
      className={clsx(className, styles.tabsTrigger)}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </TabsGroup.Trigger>
  );
});

TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = forwardRef<
  HTMLDivElement,
  TabsGroup.TabsContentProps & RefAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <TabsGroup.Content
      {...props}
      ref={ref}
      className={clsx(className, styles.tabsContent)}
    >
      {children}
    </TabsGroup.Content>
  );
});

TabsContent.displayName = 'TabsContent';

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
};