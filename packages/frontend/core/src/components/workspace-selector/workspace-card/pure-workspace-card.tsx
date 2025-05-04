import { Skeleton } from '@affine/component';
import { useWorkspaceInfo } from '@affine/core/components/hooks/use-workspace-info';
import type { WorkspaceMetadata } from '@affine/core/modules/workspace';
import { UNTITLED_WORKSPACE_NAME } from '@affine/env/constant';
import { DoneIcon } from '@blocksuite/icons/rc';
import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { WorkspaceAvatar } from '../../workspace-avatar';
import * as styles from './styles.css';

export const PureWorkspaceCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    workspaceMetadata: WorkspaceMetadata;
    avatarSize?: number;
    disable?: boolean;
    active?: boolean;
  }
>(
  (
    {
      workspaceMetadata,
      avatarSize = 32,
      className,
      disable,
      active,
      ...props
    },
    ref
  ) => {
    const information = useWorkspaceInfo(workspaceMetadata);

    const name = information?.name ?? UNTITLED_WORKSPACE_NAME;

    return (
      <div
        className={clsx(
          styles.container,
          disable ? styles.disable : null,
          className
        )}
        role="button"
        tabIndex={0}
        data-testid="workspace-card"
        ref={ref}
        {...props}
      >
        <div className={styles.infoContainer}>
          {information ? (
            <WorkspaceAvatar
              meta={workspaceMetadata}
              rounded={3}
              data-testid="workspace-avatar"
              size={avatarSize}
              name={name}
              colorfulFallback
            />
          ) : (
            <Skeleton width={avatarSize} height={avatarSize} />
          )}
          <div className={styles.workspaceTitleContainer}>
            {information ? (
              <span className={styles.workspaceName}>{information.name}</span>
            ) : (
              <Skeleton width={100} />
            )}
          </div>
        </div>
        {active && (
          <div className={styles.activeContainer}>
            <DoneIcon className={styles.activeIcon} />
          </div>
        )}
      </div>
    );
  }
);

PureWorkspaceCard.displayName = 'PureWorkspaceCard';
