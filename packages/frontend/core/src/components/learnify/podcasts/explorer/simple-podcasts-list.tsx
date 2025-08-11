import { IconButton, toast,Tooltip } from '@affine/component';
import {
  AiIcon,
  CloudWorkspaceIcon,
  CodeIcon,
  FavoritedIcon,
  FavoriteIcon,
  LanguageIcon,
  LayerIcon,
  LightPanelIcon,
  MoreHorizontalIcon,
  PresentationIcon,
  UserGuideIcon,
} from '@blocksuite/icons/rc';
import { useLiveData } from '@toeverything/infra';
import { memo, useCallback, useContext, useMemo, useState } from 'react';

import { DocExplorerContext } from '../../../explorer/context';
import { mockPodcastItems } from '../mock-data';
import * as styles from './simple-podcasts-list.css';

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'AI Tech': <AiIcon />,
  'Frontend Dev': <CodeIcon />,
  'Product Design': <PresentationIcon />,
  Architecture: <LayerIcon />,
  Languages: <LanguageIcon />,
  Startup: <LightPanelIcon />,
  DevOps: <CloudWorkspaceIcon />,
  Career: <UserGuideIcon />,
};

export const SimplePodcastsList = memo(function SimplePodcastsList() {
  const contextValue = useContext(DocExplorerContext);
  const selectedDocIds = useLiveData(contextValue.selectedDocIds$);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Shuffle the podcast items randomly
  const shuffledPodcasts = useMemo(() => {
    const shuffled = [...mockPodcastItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const handleItemClick = useCallback(
    (id: string) => {
      contextValue.selectedDocIds$.next([id]);
    },
    [contextValue]
  );

  const handleFavoriteClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        toast('Feature in development: Removed from favorites');
      } else {
        newSet.add(id);
        toast('Feature in development: Added to favorites');
      }
      return newSet;
    });
  }, []);

  const handleMoreClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toast('Feature in development: More options menu');
  }, []);

  return (
    <div className={styles.container}>
      {shuffledPodcasts.map(item => (
        <div
          key={item.id}
          className={styles.item}
          data-selected={selectedDocIds.includes(item.id)}
          onClick={() => handleItemClick(item.id)}
        >
          <div className={styles.iconWrapper}>
            {categoryIcons[item.category] || <CodeIcon />}
          </div>
          <div className={styles.itemContent}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.description}>{item.description}</p>
          </div>
          <span className={styles.duration}>{item.duration}</span>
          <div className={styles.hostInfo}>
            <span className={styles.hostLabel}>by</span>
            <span className={styles.hostNames}>
              {item.hosts?.join(', ') || 'Unknown'}
            </span>
          </div>
          <div className={styles.actionButtons}>
            <Tooltip content="Add to favorites">
              <IconButton
                size="20"
                onClick={e => handleFavoriteClick(e, item.id)}
                icon={
                  favoriteIds.has(item.id) ? (
                    <FavoritedIcon />
                  ) : (
                    <FavoriteIcon />
                  )
                }
              />
            </Tooltip>
            <Tooltip content="More options">
              <IconButton
                size="20"
                onClick={handleMoreClick}
                icon={<MoreHorizontalIcon />}
              />
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
});
