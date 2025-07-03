import { FlexWrapper } from '@affine/component';
import { ExplorerDisplayMenuButton } from '@affine/core/components/explorer/display-menu';
import { ViewToggle } from '@affine/core/components/explorer/display-menu/view-toggle';
import { ExplorerNavigation } from '@affine/core/components/explorer/header/navigation';
import type { ExplorerDisplayPreference } from '@affine/core/components/explorer/types';
import { Header } from '@affine/core/components/pure/header';

export const FlashcardsHeader = ({
  displayPreference,
  onDisplayPreferenceChange,
}: {
  displayPreference: ExplorerDisplayPreference;
  onDisplayPreferenceChange: (
    // eslint-disable-next-line no-unused-vars
    displayPreference: ExplorerDisplayPreference
  ) => void;
}) => {
  return (
    <Header
      right={
        <FlexWrapper gap={16}>
          <ViewToggle
            view={displayPreference.view ?? 'list'}
            onViewChange={view => {
              onDisplayPreferenceChange({ ...displayPreference, view });
            }}
          />
          <ExplorerDisplayMenuButton
            displayPreference={displayPreference}
            onDisplayPreferenceChange={onDisplayPreferenceChange}
          />
        </FlexWrapper>
      }
      left={<ExplorerNavigation active="flashcards" />}
    />
  );
};
