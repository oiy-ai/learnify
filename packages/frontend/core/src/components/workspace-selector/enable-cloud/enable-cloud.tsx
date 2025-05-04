import type { Server } from '@affine/core/modules/cloud';
import { CloudWorkspaceIcon } from '@blocksuite/icons/rc';

import { ServerSelector } from '../../server-selector';
import * as styles from './enable-cloud.css';

export const CustomServerEnableCloud = ({
  serverList,
  selectedServer,
  setSelectedServer,
  title,
  description,
}: {
  serverList: Server[];
  selectedServer: Server;
  title?: string;
  description?: string;
  setSelectedServer: (server: Server) => void;
}) => {
  return (
    <div className={styles.root}>
      <CloudWorkspaceIcon width={'36px'} height={'36px'} />
      <div className={styles.textContainer}>
        {title ? <div className={styles.title}>{title}</div> : null}
        {description ? (
          <div className={styles.description}>{description}</div>
        ) : null}
      </div>
      <div className={styles.serverSelector}>
        <ServerSelector
          servers={serverList}
          selectedSeverName={`${selectedServer.config$.value.serverName} (${selectedServer.baseUrl})`}
          onSelect={setSelectedServer}
        />
      </div>
    </div>
  );
};
