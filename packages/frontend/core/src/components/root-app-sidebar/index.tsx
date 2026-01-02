// Import is already correct, no changes needed
import {
  // AddPageButton,
  // AppDownloadButton,
  AppSidebar,
  // MenuItem,
  // MenuLinkItem,
  QuickSearchInput,
  SidebarContainer,
  SidebarScrollableContainer,
} from '@affine/core/modules/app-sidebar/views';
// import { ExternalMenuLinkItem } from '@affine/core/modules/app-sidebar/views/menu-item/external-menu-link-item';
import { AuthService /* ServerService */ } from '@affine/core/modules/cloud';
// import { WorkspaceDialogService } from '@affine/core/modules/dialogs';
// import { FeatureFlagService } from '@affine/core/modules/feature-flag';
import { CMDKQuickSearchService } from '@affine/core/modules/quicksearch/services/cmdk';
import type { Workspace } from '@affine/core/modules/workspace';
// import { useI18n } from '@affine/i18n';
// import { track } from '@affine/track';
import type { Store } from '@blocksuite/affine/store';
import {} from // AiOutlineIcon,
// AllDocsIcon,
// ImportIcon,
// JournalIcon,
// SettingsIcon,
'@blocksuite/icons/rc';
import {
  useLiveData,
  /* useService, */ useServices,
} from '@toeverything/infra';
import type { ReactElement } from 'react';
import { memo, useCallback, useState } from 'react';

// import {
//   CollapsibleSection,
//   NavigationPanelCollections,
//   NavigationPanelFavorites,
//   NavigationPanelMigrationFavorites,
//   NavigationPanelOrganize,
//   NavigationPanelTags,
// } from '../../desktop/components/navigation-panel';
import { WorkbenchService } from '../../modules/workbench';
import { FlashcardsNavigator } from '../learnify/flashcards/navigator';
import { MindMapsNavigator } from '../learnify/mind-maps/navigator';
import { NotesNavigator } from '../learnify/notes/navigator';
import { PodcastsNavigator } from '../learnify/podcasts/navigator';
import { ProgressNavigator } from '../learnify/progress/navigator';
import { AddLinkButton } from '../learnify/sources/buttons/add-link-button';
import { RecordButton } from '../learnify/sources/buttons/record-button';
import { UploadButton } from '../learnify/sources/buttons/upload-button';
import { NavigationPanelSources } from '../learnify/sources/navigator';
import { WorkspaceNavigator } from '../workspace-selector';
import { Tabs } from './hover-tabs';
import {
  bottomContainer,
  featurePanelWrapper,
  navigationWrapper,
  progressWrapper,
  quickSearch,
  quickSearchAndNewPage,
  referenceHeader,
  referenceWrapper,
  scrollableWrapper,
  tabsContentWrapper,
  tabsListCustom,
  tabsWrapper,
  workspaceAndUserWrapper,
  workspaceWrapper,
} from './index.css';
// import { InviteMembersButton } from './invite-members-button';
// import { AppSidebarJournalButton } from './journal-button';
// import { NotificationButton } from './notification-button';
import { SidebarAudioPlayer } from './sidebar-audio-player';
// import { TemplateDocEntrance } from './template-doc-entrance';
// import { TrashButton } from './trash-button';
// import { UpdaterButton } from './updater-button';
import UserInfo from './user-info';

export type RootAppSidebarProps = {
  isPublicWorkspace: boolean;
  onOpenQuickSearchModal: () => void;
  currentWorkspace: Workspace;
  // openPage: (pageId: string) => void;
  createPage: () => Store;
  paths: {
    // all: (workspaceId: string) => string;
    // trash: (workspaceId: string) => string;
    // shared: (workspaceId: string) => string;
  };
};

// const AllDocsButton = () => {
//   const t = useI18n();
//   const { workbenchService } = useServices({
//     WorkbenchService,
//   });
//   const workbench = workbenchService.workbench;
//   const allPageActive = useLiveData(
//     workbench.location$.selector(location => location.pathname === '/all')
//   );

//   return (
//     <MenuLinkItem icon={<AllDocsIcon />} active={allPageActive} to={'/all'}>
//       <span data-testid="all-pages">
//         {t['com.affine.workspaceSubPath.all']()}
//       </span>
//     </MenuLinkItem>
//   );
// };

// // @ts-expect-error TS6133: AIChatButton is declared but its value is never read

// const AIChatButton = () => {
//   const featureFlagService = useService(FeatureFlagService);
//   const serverService = useService(ServerService);
//   const serverFeatures = useLiveData(serverService.server.features$);
//   const enableAI = useLiveData(featureFlagService.flags.enable_ai.$);

//   const { workbenchService } = useServices({
//     WorkbenchService,
//   });
//   const workbench = workbenchService.workbench;
//   const aiChatActive = useLiveData(
//     workbench.location$.selector(location => location.pathname === '/chat')
//   );

//   if (!enableAI || !serverFeatures?.copilot) {
//     return null;
//   }

//   return (
//     <MenuLinkItem icon={<AiOutlineIcon />} active={aiChatActive} to={'/chat'}>
//       <span data-testid="ai-chat">Intelligence</span>
//     </MenuLinkItem>
//   );
// };

/**
 * This is for the whole affine app sidebar.
 * This component wraps the app sidebar in `@affine/component` with logic and data.
 *
 */
export const RootAppSidebar = memo((): ReactElement => {
  // workbenchService, authService, authService
  const { cMDKQuickSearchService, workbenchService } = useServices({
    WorkbenchService,
    CMDKQuickSearchService,
    AuthService,
  });

  const [sidebarTab, setSidebarTab] = useState('mindmap');

  // const sessionStatus = useLiveData(authService.session.status$);
  // const t = useI18n();
  // const workspaceDialogService = useService(WorkspaceDialogService);
  const workbench = workbenchService.workbench;
  const workspaceSelectorOpen = useLiveData(workbench.workspaceSelectorOpen$);
  const onOpenQuickSearchModal = useCallback(() => {
    cMDKQuickSearchService.toggle();
  }, [cMDKQuickSearchService]);

  const onWorkspaceSelectorOpenChange = useCallback(
    (open: boolean) => {
      workbench.setWorkspaceSelectorOpen(open);
    },
    [workbench]
  );

  // const onOpenSettingModal = useCallback(() => {
  //   workspaceDialogService.open('setting', {
  //     activeTab: 'appearance',
  //   });
  //   track.$.navigationPanel.$.openSettings();
  // }, [workspaceDialogService]);

  // const handleOpenDocs = useCallback(
  //   (result: {
  //     docIds: string[];
  //     entryId?: string;
  //     isWorkspaceFile?: boolean;
  //   }) => {
  //     const { docIds, entryId, isWorkspaceFile } = result;
  //     // If the imported file is a workspace file, open the entry page.
  //     if (isWorkspaceFile && entryId) {
  //       workbench.openDoc(entryId);
  //     } else if (!docIds.length) {
  //       return;
  //     }
  //     // Open all the docs when there are multiple docs imported.
  //     if (docIds.length > 1) {
  //       workbench.openAll();
  //     } else {
  //       // Otherwise, open the only doc.
  //       workbench.openDoc(docIds[0]);
  //     }
  //   },
  //   [workbench]
  // );

  // const onOpenImportModal = useCallback(() => {
  //   track.$.navigationPanel.importModal.open();
  //   workspaceDialogService.open('import', undefined, payload => {
  //     if (!payload) {
  //       return;
  //     }
  //     handleOpenDocs(payload);
  //   });
  // }, [workspaceDialogService, handleOpenDocs]);

  return (
    <AppSidebar>
      <SidebarContainer>
        <div className={workspaceAndUserWrapper}>
          <div className={workspaceWrapper}>
            <WorkspaceNavigator
              showEnableCloudButton
              showSyncStatus
              open={workspaceSelectorOpen}
              onOpenChange={onWorkspaceSelectorOpenChange}
              dense={false}
            />
          </div>
          <div className={quickSearchAndNewPage}>
            <QuickSearchInput
              className={quickSearch}
              data-testid="slider-bar-quick-search-button"
              data-event-props="$.navigationPanel.$.quickSearch"
              onClick={onOpenQuickSearchModal}
            />
          </div>
          <UserInfo />
        </div>
        {/* <AIChatButton /> */}
        <div className={featurePanelWrapper}>
          <Tabs.Root
            value={sidebarTab}
            onValueChange={setSidebarTab}
            className={tabsWrapper}
            triggerMode="hover"
          >
            <Tabs.List className={tabsListCustom}>
              <Tabs.Trigger
                value="mindmap"
                onClick={() => {
                  if (environment.isMobile) return;
                  if (sidebarTab === 'mindmap') {
                    workbench.openMindMaps();
                  }
                }}
              >
                MindMaps
              </Tabs.Trigger>
              <Tabs.Trigger
                value="notes"
                onClick={() => {
                  if (environment.isMobile) return;
                  if (sidebarTab === 'notes') {
                    workbench.openNotes();
                  }
                }}
              >
                Notes
              </Tabs.Trigger>
              <Tabs.Trigger
                value="flashcards"
                onClick={() => {
                  if (environment.isMobile) return;
                  if (sidebarTab === 'flashcards') {
                    workbench.openFlashcards();
                  }
                }}
              >
                Flashcards
              </Tabs.Trigger>
              <Tabs.Trigger
                value="podcasts"
                onClick={() => {
                  if (environment.isMobile) return;
                  if (sidebarTab === 'podcasts') {
                    workbench.openPodcasts();
                  }
                }}
              >
                Podcasts
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="mindmap" className={tabsContentWrapper}>
              <MindMapsNavigator />
            </Tabs.Content>
            <Tabs.Content value="notes" className={tabsContentWrapper}>
              <NotesNavigator />
            </Tabs.Content>
            <Tabs.Content value="flashcards" className={tabsContentWrapper}>
              <FlashcardsNavigator />
            </Tabs.Content>
            <Tabs.Content value="podcasts" className={tabsContentWrapper}>
              <PodcastsNavigator />
            </Tabs.Content>
          </Tabs.Root>
        </div>
        <div className={progressWrapper}>
          <ProgressNavigator />
        </div>
        <div className={referenceWrapper}>
          <div className={referenceHeader}>{'Reference Materials'}</div>
          <UploadButton />
          <AddLinkButton />
          <RecordButton />
        </div>

        {/* <AllDocsButton /> */}
        {/* <AppSidebarJournalButton /> */}
        {/* {sessionStatus === 'authenticated' && <NotificationButton />} */}
        {/* <MenuItem
          data-testid="slider-bar-workspace-setting-button"
          icon={<SettingsIcon />}
          onClick={onOpenSettingModal}
        >
          <span data-testid="settings-modal-trigger">
            {t['com.affine.settingSidebar.title']()}
          </span>
        </MenuItem> */}
      </SidebarContainer>
      <SidebarScrollableContainer className={scrollableWrapper}>
        <div className={navigationWrapper}>
          <NavigationPanelSources />
        </div>
        {/* <NavigationPanelFavorites /> */}
        {/* <NavigationPanelOrganize /> */}
        {/* <NavigationPanelMigrationFavorites /> */}
        {/* <NavigationPanelTags /> */}
        {/* <NavigationPanelCollections /> */}
        {/* <CollapsibleSection
          name="others"
          title={t['com.affine.rootAppSidebar.others']()}
          contentStyle={{ padding: '6px 8px 0 8px' }}
        >
          <TrashButton />
          <MenuItem
            data-testid="slider-bar-import-button"
            icon={<ImportIcon />}
            onClick={onOpenImportModal}
          >
            <span data-testid="import-modal-trigger">{t['Import']()}</span>
          </MenuItem>
          <InviteMembersButton />
          <TemplateDocEntrance />
          <ExternalMenuLinkItem
            href="https://affine.pro/blog?tag=Release+Note"
            icon={<JournalIcon />}
            label={t['com.affine.app-sidebar.learn-more']()}
          />
        </CollapsibleSection> */}
      </SidebarScrollableContainer>
      <SidebarContainer className={bottomContainer}>
        <SidebarAudioPlayer />
        {/* {BUILD_CONFIG.isElectron ? <UpdaterButton /> : <AppDownloadButton />} */}
      </SidebarContainer>
    </AppSidebar>
  );
});

RootAppSidebar.displayName = 'memo(RootAppSidebar)';
