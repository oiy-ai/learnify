import { Checkbox } from '@affine/component';
import { ExportToPdfIcon, ImageIcon, LinkIcon } from '@blocksuite/icons/rc';
import { useState } from 'react';

import * as styles from './index.css';
import { mockSources } from './mock-data';

interface SourceCardProps {
  id: string;
  name: string;
  category: string;
  url?: string;
  checked: boolean;
  description: string;
  // eslint-disable-next-line no-unused-vars
  onCheckedChange: (id: string, checked: boolean) => void;
}

const SourceCard = ({
  id,
  name,
  category,
  checked,
  description,
  onCheckedChange,
}: SourceCardProps) => {
  const getIcon = () => {
    switch (category) {
      case 'pdf':
        return <ExportToPdfIcon className={styles.sourceIcon} />;
      case 'image':
        return <ImageIcon className={styles.sourceIcon} />;
      case 'link':
        return <LinkIcon className={styles.sourceIcon} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.sourceCard}>
      <Checkbox
        className={styles.checkbox}
        checked={checked}
        onChange={() => {
          onCheckedChange(id, !checked);
        }}
      />
      {getIcon()}
      <div className={styles.sourceInfo}>
        <div className={styles.sourceName}>{name}</div>
        <div className={styles.sourceDescription}>{description}</div>
      </div>
    </div>
  );
};

export const NavigationPanelSources = () => {
  const [checkedSources, setCheckedSources] = useState<Record<string, boolean>>(
    {}
  );

  const handleCheckedChange = (id: string, checked: boolean) => {
    setCheckedSources(prev => ({
      ...prev,
      [id]: checked,
    }));
  };

  return (
    <div className={styles.sourcesContainer}>
      <div className={styles.sourcesHeader}>{'Reference Materials'}</div>
      {mockSources.map(source => (
        <SourceCard
          key={source.id}
          id={source.id}
          name={source.name}
          category={source.category}
          url={source.url}
          description={source.description}
          checked={checkedSources[source.id] || false}
          onCheckedChange={handleCheckedChange}
        />
      ))}
    </div>
  );
};
