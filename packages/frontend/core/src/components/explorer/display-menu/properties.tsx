import { Button } from '@affine/component';
import { WorkspacePropertyService } from '@affine/core/modules/workspace-property';
import { useI18n } from '@affine/i18n';
import track from '@affine/track';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useMemo } from 'react';

import { WorkspacePropertyName } from '../../properties';
import { WorkspacePropertyTypes } from '../../workspace-property-types';
import { generateExplorerPropertyList } from '../properties';
import type { ExplorerDisplayPreference } from '../types';
import * as styles from './properties.css';

export const DisplayProperties = ({
  displayPreference,
  onDisplayPreferenceChange,
}: {
  displayPreference: ExplorerDisplayPreference;
  onDisplayPreferenceChange: (
    displayPreference: ExplorerDisplayPreference
  ) => void;
}) => {
  const t = useI18n();
  const workspacePropertyService = useService(WorkspacePropertyService);
  const propertyList = useLiveData(workspacePropertyService.sortedProperties$);
  const explorerPropertyList = useMemo(() => {
    return generateExplorerPropertyList(propertyList);
  }, [propertyList]);

  const displayProperties = displayPreference.displayProperties;

  const handleDisplayPropertiesChange = useCallback(
    (displayProperties: string[]) => {
      onDisplayPreferenceChange({ ...displayPreference, displayProperties });
    },
    [displayPreference, onDisplayPreferenceChange]
  );

  const handlePropertyClick = useCallback(
    (key: string) => {
      handleDisplayPropertiesChange(
        displayProperties && displayProperties.includes(key)
          ? displayProperties.filter(k => k !== key)
          : [...(displayProperties || []), key]
      );
    },
    [displayProperties, handleDisplayPropertiesChange]
  );

  return (
    <div className={styles.root}>
      <section className={styles.sectionLabel}>
        {t['com.affine.all-docs.display.properties']()}
      </section>
      <div className={styles.properties}>
        {explorerPropertyList
          .filter(p => p.systemProperty)
          .map(property => {
            return (
              <PropertyRenderer
                key={
                  property.systemProperty?.type ??
                  property.workspaceProperty?.id
                }
                property={property}
                displayProperties={displayProperties ?? []}
                handlePropertyClick={handlePropertyClick}
              />
            );
          })}
      </div>
      <div className={styles.properties}>
        {explorerPropertyList
          .filter(p => !p.systemProperty)
          .map(property => {
            return (
              <PropertyRenderer
                key={
                  property.systemProperty?.type ??
                  property.workspaceProperty?.id
                }
                property={property}
                displayProperties={displayProperties ?? []}
                handlePropertyClick={handlePropertyClick}
              />
            );
          })}
      </div>
    </div>
  );
};

const PropertyRenderer = ({
  property,
  displayProperties,
  handlePropertyClick,
}: {
  property: ReturnType<typeof generateExplorerPropertyList>[number];
  displayProperties: string[];
  handlePropertyClick: (key: string) => void;
}) => {
  const t = useI18n();
  const { systemProperty, workspaceProperty } = property;
  const key = systemProperty
    ? `system:${systemProperty.type}`
    : workspaceProperty
      ? `property:${workspaceProperty?.id}`
      : null;
  const activeKey = systemProperty
    ? `system:${systemProperty.type}`
    : workspaceProperty
      ? `property:${workspaceProperty?.id}`
      : null;
  const isActive = activeKey && displayProperties.includes(activeKey);

  const showInDocList =
    systemProperty?.showInDocList ||
    (workspaceProperty &&
      WorkspacePropertyTypes[workspaceProperty.type]?.showInDocList);

  if (!key || !showInDocList) {
    return null;
  }
  return (
    <Button
      key={key}
      data-show={isActive}
      onClick={() => {
        track.allDocs.header.displayMenu.editDisplayMenu({
          control: 'displayProperties',
          type: systemProperty?.type ?? 'custom-property',
        });
        handlePropertyClick(key);
      }}
      className={styles.property}
      data-key={key}
    >
      {workspaceProperty ? (
        <WorkspacePropertyName propertyInfo={workspaceProperty} />
      ) : systemProperty ? (
        t.t(systemProperty.name)
      ) : null}
    </Button>
  );
};
