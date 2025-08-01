import { FlexWrapper } from '@affine/component';
import { ExplorerDisplayMenuButton } from '@affine/core/components/explorer/display-menu';
import { ExplorerNavigation } from '@affine/core/components/explorer/header/navigation';
import type { ExplorerDisplayPreference } from '@affine/core/components/explorer/types';
import { Header } from '@affine/core/components/pure/header';

export const NotesHeader = ({
  displayPreference,
  onDisplayPreferenceChange,
}: {
  displayPreference: ExplorerDisplayPreference;
  onDisplayPreferenceChange: (
     
    displayPreference: ExplorerDisplayPreference
  ) => void;
}) => {
  return (
    <Header
      right={
        <FlexWrapper gap={16}>
          <ExplorerDisplayMenuButton
            displayPreference={displayPreference}
            onDisplayPreferenceChange={onDisplayPreferenceChange}
          />
        </FlexWrapper>
      }
      left={<ExplorerNavigation active="notes" />}
    />
  );
};
